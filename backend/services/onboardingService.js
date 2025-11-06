const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;

class OnboardingService {
    // Stage definitions
    static STAGES = {
        PROFILE: 'profile',
        INTERVIEW: 'interview',
        DOCUMENTS: 'documents',
        OFFER: 'offer',
        ID_CARD: 'id_card',
        COMPLETED: 'completed',
        FAILED: 'failed'
    };

    static STATUS = {
        PENDING: 'pending',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        FAILED: 'failed'
    };

    /**
     * Get user's current onboarding stage
     */
    static async getUserOnboardingStage(userId) {
        try {
            const [rows] = await db.query(
                'SELECT onboarding_stage, onboarding_status, retry_after, onboarding_completed_at FROM users WHERE id = ?',
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user's onboarding stage
     */
    static async updateOnboardingStage(userId, stage, status = OnboardingService.STATUS.IN_PROGRESS, failedReason = null) {
        try {
            const retryAfter = stage === OnboardingService.STAGES.FAILED ? 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null; // 30 days retry

            await db.query(
                `UPDATE users SET 
                    onboarding_stage = ?,
                    onboarding_status = ?,
                    failed_at_stage = ?,
                    failed_at = ?,
                    retry_after = ?,
                    onboarding_completed_at = ?
                WHERE id = ?`,
                [
                    stage,
                    status,
                    stage === OnboardingService.STAGES.FAILED ? stage : null,
                    stage === OnboardingService.STAGES.FAILED ? new Date() : null,
                    retryAfter,
                    stage === OnboardingService.STAGES.COMPLETED ? new Date() : null,
                    userId
                ]
            );

            // Update onboarding progress
            await db.query(
                `INSERT INTO onboarding_progress (user_id, current_stage, stage_status, failed_reason, retry_after)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 current_stage = VALUES(current_stage),
                 stage_status = VALUES(stage_status),
                 stage_completed_at = CASE 
                    WHEN VALUES(stage_status) = 'completed' THEN NOW() 
                    ELSE stage_completed_at 
                 END,
                 failed_reason = VALUES(failed_reason),
                 retry_after = VALUES(retry_after)`,
                [userId, stage, status, failedReason, retryAfter]
            );

            return { success: true, stage, status, retryAfter };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if user can proceed to next stage
     */
    static async canProceedToStage(userId, targetStage) {
        try {
            const current = await this.getUserOnboardingStage(userId);
            if (!current) return false;

            // Check if user is blocked due to failure
            if (current.onboarding_status === OnboardingService.STATUS.FAILED) {
                if (current.retry_after && new Date() < new Date(current.retry_after)) {
                    return false;
                }
            }

            // Check stage progression
            const stageOrder = [
                OnboardingService.STAGES.PROFILE,
                OnboardingService.STAGES.INTERVIEW,
                OnboardingService.STAGES.DOCUMENTS,
                OnboardingService.STAGES.OFFER,
                OnboardingService.STAGES.ID_CARD,
                OnboardingService.STAGES.COMPLETED
            ];

            const currentIndex = stageOrder.indexOf(current.onboarding_stage);
            const targetIndex = stageOrder.indexOf(targetStage);

            return targetIndex === currentIndex || targetIndex === currentIndex + 1;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Start interview process for user
     */
    static async startInterview(userId) {
        try {
            const canProceed = await this.canProceedToStage(userId, OnboardingService.STAGES.INTERVIEW);
            if (!canProceed) {
                throw new Error('Cannot proceed to interview stage');
            }

            // Initialize interview rounds
            await db.query(
                `INSERT INTO interview_rounds (user_id, round_number, status) VALUES 
                 (?, 1, 'pending'), (?, 2, 'pending'), (?, 3, 'pending')`,
                [userId, userId, userId]
            );

            await this.updateOnboardingStage(userId, OnboardingService.STAGES.INTERVIEW);
            return { success: true, message: 'Interview process started' };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Submit interview round
     */
    static async submitInterviewRound(userId, roundNumber, answers) {
        try {
            // Get questions for this round
            const [questions] = await db.query(
                'SELECT * FROM interview_questions WHERE round_number = ?',
                [roundNumber]
            );

            // Calculate score
            let score = 0;
            const totalPossible = questions.reduce((sum, q) => sum + q.points, 0);

            answers.forEach((answer, index) => {
                if (index < questions.length && answer === questions[index].correct_answer) {
                    score += questions[index].points;
                }
            });

            const percentage = (score / totalPossible) * 100;
            const passed = percentage >= 70; // 70% passing criteria

            // Update round status
            await db.query(
                `UPDATE interview_rounds 
                 SET status = ?, score = ?, completed_at = NOW()
                 WHERE user_id = ? AND round_number = ?`,
                [passed ? 'passed' : 'failed', score, userId, roundNumber]
            );

            if (!passed) {
                // Failed the round - fail entire interview
                await this.updateOnboardingStage(
                    userId, 
                    OnboardingService.STAGES.FAILED, 
                    OnboardingService.STATUS.FAILED,
                    `Failed interview round ${roundNumber}`
                );
                return { success: false, message: 'Interview failed', retryAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };
            }

            // Check if all rounds completed
            const [completedRounds] = await db.query(
                'SELECT COUNT(*) as count FROM interview_rounds WHERE user_id = ? AND status = "passed"',
                [userId]
            );

            if (completedRounds[0].count === 3) {
                // All rounds passed
                await this.updateOnboardingStage(userId, OnboardingService.STAGES.DOCUMENTS);
                return { success: true, message: 'All interview rounds completed successfully' };
            }

            return { success: true, message: `Round ${roundNumber} completed`, score, percentage };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Upload documents
     */
    static async uploadDocument(userId, documentData) {
        try {
            const canProceed = await this.canProceedToStage(userId, OnboardingService.STAGES.DOCUMENTS);
            if (!canProceed) {
                throw new Error('Cannot upload documents at current stage');
            }

            const result = await db.query(
                `INSERT INTO candidate_documents 
                 (user_id, document_type, file_path, original_name, file_size, mime_type)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    documentData.type,
                    documentData.filePath,
                    documentData.originalName,
                    documentData.fileSize,
                    documentData.mimeType
                ]
            );

            // Check if all required documents are uploaded
            const [uploadedDocs] = await db.query(
                'SELECT DISTINCT document_type FROM candidate_documents WHERE user_id = ?',
                [userId]
            );

            const requiredDocs = ['resume', 'id_proof', 'address_proof', 'education_certificate', 'photo'];
            const uploadedTypes = uploadedDocs.map(doc => doc.document_type);
            const allUploaded = requiredDocs.every(doc => uploadedTypes.includes(doc));

            if (allUploaded) {
                await this.updateOnboardingStage(userId, OnboardingService.STAGES.OFFER);
            }

            return { success: true, documentId: result.insertId, allUploaded };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Upload offer letter (admin only)
     */
    static async uploadOfferLetter(adminId, userId, fileData) {
        try {
            const canProceed = await this.canProceedToStage(userId, OnboardingService.STAGES.OFFER);
            if (!canProceed) {
                throw new Error('Cannot upload offer letter at current stage');
            }

            const result = await db.query(
                `INSERT INTO offer_letters 
                 (user_id, uploaded_by, file_path, original_name)
                 VALUES (?, ?, ?, ?)`,
                [userId, adminId, fileData.filePath, fileData.originalName]
            );

            await this.updateOnboardingStage(userId, OnboardingService.STAGES.ID_CARD);
            return { success: true, offerLetterId: result.insertId };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Sign offer letter
     */
    static async signOfferLetter(userId, signedFileData) {
        try {
            await db.query(
                `UPDATE offer_letters 
                 SET signed_file_path = ?, signed_original_name = ?, signed_at = NOW(), status = 'signed'
                 WHERE user_id = ? AND status = 'pending'`,
                [signedFileData.filePath, signedFileData.originalName, userId]
            );
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Generate ID card
     */
    static async generateIdCard(userId, cardData) {
        try {
            const canProceed = await this.canProceedToStage(userId, OnboardingService.STAGES.ID_CARD);
            if (!canProceed) {
                throw new Error('Cannot generate ID card at current stage');
            }

            // Generate unique card number
            const cardNumber = `HRC${Date.now()}${userId}`;
            
            const result = await db.query(
                `INSERT INTO id_cards (user_id, card_number, file_path)
                 VALUES (?, ?, ?)`,
                [userId, cardNumber, cardData.filePath]
            );

            await this.updateOnboardingStage(userId, OnboardingService.STAGES.COMPLETED);
            return { success: true, cardNumber, id: result.insertId };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get complete onboarding status
     */
    static async getCompleteOnboardingStatus(userId) {
        try {
            const [user] = await db.query(
                'SELECT onboarding_stage, onboarding_status, retry_after, onboarding_completed_at FROM users WHERE id = ?',
                [userId]
            );

            if (!user[0]) return null;

            const [interviewRounds] = await db.query(
                'SELECT * FROM interview_rounds WHERE user_id = ? ORDER BY round_number',
                [userId]
            );

            const [documents] = await db.query(
                'SELECT * FROM candidate_documents WHERE user_id = ? ORDER BY uploaded_at DESC',
                [userId]
            );

            const [offerLetter] = await db.query(
                'SELECT * FROM offer_letters WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1',
                [userId]
            );

            const [idCard] = await db.query(
                'SELECT * FROM id_cards WHERE user_id = ? ORDER BY generated_at DESC LIMIT 1',
                [userId]
            );

            return {
                currentStage: user[0].onboarding_stage,
                status: user[0].onboarding_status,
                retryAfter: user[0].retry_after,
                completedAt: user[0].onboarding_completed_at,
                interviewRounds,
                documents,
                offerLetter: offerLetter[0] || null,
                idCard: idCard[0] || null
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Reset onboarding for retry
     */
    static async resetOnboardingForRetry(userId) {
        try {
            await db.query('DELETE FROM interview_rounds WHERE user_id = ?', [userId]);
            await db.query('DELETE FROM candidate_documents WHERE user_id = ?', [userId]);
            await db.query('DELETE FROM offer_letters WHERE user_id = ?', [userId]);
            await db.query('DELETE FROM id_cards WHERE user_id = ?', [userId]);
            
            await this.updateOnboardingStage(userId, OnboardingService.STAGES.PROFILE);
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OnboardingService;

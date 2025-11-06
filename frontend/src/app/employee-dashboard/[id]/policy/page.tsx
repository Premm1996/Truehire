'use client';

import React, { useState } from 'react';
import { BookOpen, FileText, Clock, AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LeavePolicyPage() {
  const [showLeavePolicy, setShowLeavePolicy] = useState(false);
  const [showAttendancePolicy, setShowAttendancePolicy] = useState(false);
  const [showInductionHandout, setShowInductionHandout] = useState(false);
  const [showSexualHarassment, setShowSexualHarassment] = useState(false);
  const monthlyLeaves = [
    { month: 'January', leaves: 1.5 },
    { month: 'February', leaves: 1.5 },
    { month: 'March', leaves: 2 },
    { month: 'April', leaves: 1.5 },
    { month: 'May', leaves: 1.5 },
    { month: 'June', leaves: 2 },
    { month: 'July', leaves: 1.5 },
    { month: 'August', leaves: 1.5 },
    { month: 'September', leaves: 2 },
    { month: 'October', leaves: 1.5 },
    { month: 'November', leaves: 1.5 },
    { month: 'December', leaves: 2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl border border-gray-200">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Office Policy</h1>
              <p className="text-lg text-gray-600">Truerize IQ Strategic Solutions Pvt Ltd</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg max-w-4xl mb-8">
            This document outlines the guidelines for employees regarding the office policy at Truerize IQ Strategic Solutions Pvt Ltd.
            Please review all sections carefully to understand your entitlements and responsibilities.
          </p>
          <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">List of Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setShowLeavePolicy(!showLeavePolicy)}
                className="flex items-center gap-3 w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 ease-in-out"
              >
                {showLeavePolicy ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                <span className="font-medium text-base">1. Leave Policy</span>
              </button>
              <button
                onClick={() => setShowAttendancePolicy(!showAttendancePolicy)}
                className="flex items-center gap-3 w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 ease-in-out"
              >
                {showAttendancePolicy ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                <span className="font-medium text-base">2. Attendance Policy</span>
              </button>
              <button
                onClick={() => setShowInductionHandout(!showInductionHandout)}
                className="flex items-center gap-3 w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 ease-in-out"
              >
                {showInductionHandout ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                <span className="font-medium text-base">3. Induction Handout</span>
              </button>
              <button
                onClick={() => setShowSexualHarassment(!showSexualHarassment)}
                className="flex items-center gap-3 w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 ease-in-out"
              >
                {showSexualHarassment ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                <span className="font-medium text-base">4. Sexual Harassment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLeavePolicy && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          {/* Eligibility */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>An employee is not eligible for any leave during the probation period.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Any leave availed during the probation period will be treated as Leave Without Pay (LWP).</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Total Leaves */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Total Leaves
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 mb-8 leading-relaxed">
                All employees are eligible for <strong className="text-gray-900">20 leaves in a calendar year</strong>.
                The year is divided into four quarters, and employees will receive 5 leaves at the end of each quarter.
              </p>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-900 py-4">Month</TableHead>
                      <TableHead className="font-semibold text-gray-900 py-4">Number of Leaves</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyLeaves.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium py-4">{item.month}</TableCell>
                        <TableCell className="py-4">{item.leaves}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pro-rata Calculation */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <Clock className="w-6 h-6 text-blue-600" />
                Pro-rata Calculation After Probation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 mb-6 leading-relaxed">
                If an employee completes probation after a quarter has started, leave will be calculated on a pro-rata basis using the following formula:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <code className="text-gray-800 font-mono text-sm">
                  Number of days between confirmation date and end of quarter × Eligible leaves for the quarter / Number of days in the quarter
                </code>
              </div>
              <p className="text-gray-700 mb-6">The result is rounded down to the nearest decimal and credited monthly.</p>
              <div>
                <h4 className="font-bold text-gray-900 mb-4 text-lg">Illustrations</h4>
                <ul className="space-y-3 text-gray-700">
                  <li>• Probation completed on 15-Jan: Eligible for 4 leaves (Jan – 0.5, Feb – 1.5, Mar – 2)</li>
                  <li>• Probation completed on 10-Feb: Eligible for 2.5 leaves (Feb – 0.5, Mar – 2)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Leave Encashment */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <FileText className="w-6 h-6 text-purple-600" />
                Leave Encashment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ul className="space-y-4 text-gray-700">
                <li>• Any unavailed leave will be encashed at the end of each quarter at 100% of gross salary.</li>
                <li>• Example: 2 unused leaves = 2 days of gross salary.</li>
                <li>• No leaves can be carried forward or borrowed from another quarter.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Training Sessions and Induction */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <BookOpen className="w-6 h-6 text-amber-600" />
                Training Sessions and Induction
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ul className="space-y-4 text-gray-700">
                <li>• If the company schedules a training session on Saturday, attendance is mandatory.</li>
                <li>• One day's salary will be deducted for non-attendance.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Leave Approval Process */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <CheckCircle className="w-6 h-6 text-teal-600" />
                Leave Approval Process
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ol className="space-y-4 text-gray-700 list-decimal list-inside">
                <li>Fill out the Leave Form (available with HR).</li>
                <li>Get approval from your Manager.</li>
                <li>Submit the form to HR.</li>
                <li>Any leave taken without approval will be treated as Leave Without Pay (LWP), even if the employee has a leave balance.</li>
              </ol>
            </CardContent>
          </Card>

          {/* Leave Due to Medical Emergency */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Leave Due to Medical Emergency
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 mb-6">If leave exceeds two days due to illness or emergency:</p>
              <ul className="space-y-4 text-gray-700">
                <li>• Inform the Team Lead on the first day of leave.</li>
                <li>• Submit the following within 3 working days:</li>
                <ul className="ml-8 space-y-2">
                  <li>- Doctor's certificate</li>
                  <li>- Lab reports / X-ray reports (if any)</li>
                  <li>- Medical prescriptions</li>
                  <li>- Medical bills</li>
                  <li>- Any other relevant medical documents</li>
                </ul>
                <li>• Original documents must be submitted to HR upon resuming duty.</li>
                <li>• Any unapproved medical leave or forged documents will be treated as misconduct, and disciplinary/legal action may be taken.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Unauthorized Leave */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Unauthorized Leave
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ul className="space-y-4 text-gray-700">
                <li>• Absence without approval for more than 15 days will result in termination.</li>
                <li>• Repeated instances of unauthorized leave can also lead to termination, even if less than 15 days.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Compensatory Leave */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <Clock className="w-6 h-6 text-indigo-600" />
                Compensatory Leave (Saturday Work)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 leading-relaxed">
                Employees can compensate for weekday leave by working on a Saturday, but prior approval from the Manager and HR is required.
              </p>
            </CardContent>
          </Card>

          {/* Pro-rata Leave at Exit */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <FileText className="w-6 h-6 text-orange-600" />
                Pro-rata Leave at Exit
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 mb-6 leading-relaxed">
                If an employee leaves before the quarter ends, leaves will be encashed on a pro-rata basis:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <code className="text-gray-800 font-mono text-sm">
                  Number of days completed in the quarter × Eligible leaves for the quarter / Number of days in the quarter
                </code>
              </div>
              <p className="text-gray-700 mb-6">Rounded down to the nearest decimal and encashed at exit.</p>
              <div>
                <h4 className="font-bold text-gray-900 mb-4 text-lg">Illustrations</h4>
                <ul className="space-y-3 text-gray-700">
                  <li>• Last Working Day – 25 March: Eligible for 1.5 leaves for March</li>
                  <li>• Last Working Day – 8 December: No leave eligibility for December</li>
                  <li>• Last Working Day – 15 September: Eligible for 1 leave for September</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Approved By */}
          <Card className="shadow-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-10 text-center">
              <div className="max-w-md mx-auto">
                <Badge className="bg-green-100 text-green-800 border border-green-200 mb-6 px-6 py-3 text-sm font-medium">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approved
                </Badge>
                <h3 className="text-xl font-bold text-gray-900 mb-3">G. Naga Anusha</h3>
                <p className="text-gray-600 text-sm">Managing Director (Operations & Finance)</p>
                <p className="text-gray-600 text-sm">Truerize IQ Strategic Solutions Pvt Ltd</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showAttendancePolicy && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          {/* Meaning Of Attendance */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <Clock className="w-6 h-6 text-blue-600" />
                Meaning Of Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Attendance is measured of the productive number of hours delivered by an employee in the company. The attendance is under no circumstances just the physical presence of the person on his seat. If the person is present in the office and is not performing, that is not counted as attendance.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The following points will help an employee of the company to analyze about his/her attendance in the company.
              </p>
            </CardContent>
          </Card>

          {/* Attendance of the Development Department */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Attendance of the Development Department
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Odesk / Elance 9 hours of Daily Billed Work</h4>
              <p className="text-gray-700 mb-6 leading-relaxed">
                As per the Weekend off policy we need to get 45 hours of billed work on Odesk and Elance. Incase 45 hours (excluding the lunch break) are not completed the developer will have to work on Saturdays as well. Please read the following cases and decisions that have to be taken accordingly.
              </p>
              <ul className="space-y-4 text-gray-700">
                <li><strong className="text-gray-900">a).</strong> In case the project is not completed on time: In case the project is not completed on the time assigned by the client then the developer will have to work on the weekends to meet the deadline. If the developer does not come on weekends to meet the deadline his Saturday off will be deducted as a leave and whole weeks performance will be considered as nil. In case the employee has not completed the assigned task on weekdays (i.e. from Monday to Friday) and comes on Saturday to complete his task then he will not be paid overtime for that day because it is the developer's responsibility to complete the assigned task on time.</li>
                <li><strong className="text-gray-900">b).</strong> 45 hours not logged till Friday in any circumstances: The developer will have to ensure that 45 hours are billed on a running project on Odesk or Elance during the whole week. In case that is not done he/she will have to work on Saturdays and compensate for the same and no overtime shall be paid.</li>
                <li><strong className="text-gray-900">c).</strong> Leave on Weekday: In case an employee avails a leave on a weekday he would be entitled to reduce 9 hours for that leave from these 45 working hours. If a developer voluntarily work on Saturdays his leave will be covered. To compensate his leaves he need to seek approval over email from his manager as well as HR department else it would not be considered.</li>
                <li><strong className="text-gray-900">d).</strong> One Saturday Mandatory For All: One Saturday would be mandatory for all the team members. And that week all working team members give us a total of 54 (excluding the lunch break) working hours. It will be the responsibility of the Team Leaders to plan the tasks one day in advance so that the developers have enough work to work for those 9 hours. If the employee does not come on the mandatory Saturday then 4 days salary shall be deducted.</li>
              </ul>
              <h4 className="font-bold text-gray-900 mb-4 mt-8 text-lg">Daily Commits On GIT</h4>
              <p className="text-gray-700 mb-6 leading-relaxed">It is mandatory for all the developer to give two commits on GIT on daily basis. The cases for GIT commits can be analyzed as follows.</p>
              <ul className="space-y-4 text-gray-700">
                <li><strong className="text-gray-900">a).</strong> If you are working only on one project: If the developer is working only on one project then he has to give two commits on GIT that is at 12:30 PM and at the end of his shift at 6:30 PM. These commits are as important as putting tasks and logging time on ACE. Your attendance will only be complete if you have proper ACE login and two GIT commits. The GIT commits have to be given at the given time. Two commits at the end of the day will not be considered as valid and you'll be marked as absent. And no performance shall be count for that day.</li>
                <li><strong className="text-gray-900">b).</strong> If you are working on more than one projects: if you are working for more than two projects in one day. You can give a GIT Commit at the end of the project or after 4 hours whichever is Early. But A GIT commit is necessary at the end of the project.</li>
              </ul>
              <h4 className="font-bold text-gray-900 mb-4 mt-8 text-lg">Ace Management And Daily Reports</h4>
              <p className="text-gray-700 mb-6 leading-relaxed">This section expects the developer to perform the following tasks on Ace Project management System.</p>
              <ul className="space-y-4 text-gray-700">
                <li><strong className="text-gray-900">a).</strong> Effective and Accurate Timelog: This section expects the developer to duly create his task on Ace and log time for each and every task on the same. Time has to be logged using the time clock and TIMESHEETS EDITS WILL NOT BE ACCEPTED. This section holds the most weightage and importance. Ace Timelogs are just like your attendance in the company absence of timelogs means your absence in the company and whole weeks performance will be considered as nil. Ace Timelogs have to be stopped during lunch and only actually hours have to reflect through the timesheets.</li>
                <li><strong className="text-gray-900">b).</strong> Ace Forum: This point focuses on change requests or additional work that is demanded by the client. This will be the responsibility of the developer to ensure that all the points are updated on the forum and on the same date, on which these changes were demanded by the client. Later dates will not be accepted.</li>
              </ul>
              <p className="text-gray-700 mt-6 leading-relaxed">The above three points would clearly define the attendance of the development department.</p>
            </CardContent>
          </Card>

          {/* Attendance of the Marketing Department */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <FileText className="w-6 h-6 text-purple-600" />
                Attendance of the Marketing Department
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 mb-6 leading-relaxed">
                The marketing department is based on the targets each member of the department is bound to achieve. The productive attendance counts for the targets achieved by the marketing department. The ultimate responsibility lies in attending the client. The client is the sole responsibility of the team member who is handling him.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Shift timings are mandatory for everyone and punctuality as well. The evaluation form will have a section in regards to the punctuality of the individual.
              </p>
              <ul className="space-y-4 text-gray-700">
                <li><strong className="text-gray-900">a).</strong> One Saturday Mandatory For All: One Saturday would be mandatory for all the team members. And that week all working team members give us a total of 54 (excluding the lunch break) working hours. It will be the responsibility of the Team Leaders to plan the tasks one day in advance so that the team members have enough work to work for those 9 hours.</li>
                <li><strong className="text-gray-900">b).</strong> Meeting the Targets: Each team has been assigned with a target and it is mandatory to meet those targets. Rest of the details about the targets and incentives has been mentioned in the marketing policy.</li>
                <li><strong className="text-gray-900">c).</strong> Communication With Clients: Communicating with the clients is the key responsibility of the marketing department. He/she is the best person to deal with the clients and the responsible one as well. It would be advised to spend some time and check if the client is ready to hire and communicate with him at every point of time.</li>
                <li><strong className="text-gray-900">d).</strong> If the target is not achieved during the week: In case the weekly activation ratio (8-10%) and the minimum bids (which is already shared with the marketing team) are not completed by Friday then that particular team will have to work on the weekends to meet the deadline. If the team does not come on weekends to meet the deadline the Saturday off will be deducted as a leave and whole week's performance will be considered as nil. Please note that if the employee has not completed the assigned task on weekdays (i.e. from Monday to Friday) and comes on Saturday to complete his task then he will not be paid overtime for that day because it is the Team member's responsibility to complete the assigned task on time.</li>
                <li><strong className="text-gray-900">e).</strong> Leave on Weekday: In case an employee avails a leave on a weekday he would be entitled to reduce 9 hours for that leave from 45 working hours (which is excluding the lunch break). If a team member voluntarily work on Saturdays his leave will be covered. To compensate his leaves he need to seek approval from his manager as well as HR department else it would not be considered.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Working days for the purpose of Salary Calculation */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <BookOpen className="w-6 h-6 text-amber-600" />
                Working days for the purpose of Salary Calculation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 mb-6 leading-relaxed">
                As we have made only one Saturday mandatory in a month the working days for the purpose of salary shall be calculated as follows:
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Number of working days in the month + 1 (Saturday) = Total working days Per day salary shall be calculated as follows:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <code className="text-gray-800 font-mono text-sm">
                  Monthly salary / Total working days = Per day Salary
                </code>
              </div>
            </CardContent>
          </Card>

          {/* General Attendance Rules */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <CheckCircle className="w-6 h-6 text-teal-600" />
                General Attendance Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Each of the department has been assigned with separate shift timings for reporting. Please consider the following shift timings and penalties of not reporting on time.
              </p>
              <ul className="space-y-4 text-gray-700">
                <li><strong className="text-gray-900">1)</strong> 8:00 AM – 5:30 PM (Morning Shift for Marketing) Punch after 9:00 AM - 2 hours of short leave. Punch After 9:30 AM - 4 Hours of Short Leave.</li>
                <li><strong className="text-gray-900">2)</strong> 9:00AM – 6:30 PM (General Shift for Development, Marketing, HR and Accounts) Punch After 9:30 AM – 2 hours of Short Leave Punch After 10:00 AM – 4 hours of Short Leave</li>
                <li><strong className="text-gray-900">3)</strong> 12:30 PM – 9:30:00PM (Afternoon Shift for Marketing) Punch After 01:00 PM – 2 hours of Short Leave Punch After 01:30 PM – 4 hours of Short Leave</li>
                <li><strong className="text-gray-900">4)</strong> 03:00 PM – 01:00 AM (Night Shift for Development &Marketing) Punch after 3:30 PM – 2 hours of short leave Punch after 4:00 PM – 4 hours of Short Leave Night shift will be for 10 hours or 9 and a half hour. Employee will receive benefit depending on the number of hours completed by him.</li>
              </ul>
              <h4 className="font-bold text-gray-900 mb-4 mt-8 text-lg">a) 10 Hours Shift</h4>
              <ul className="space-y-3 text-gray-700">
                <li>• There will be two breaks out of which one would be dinner break and another would be a leisure break around 3:00 AM</li>
                <li>• Both the breaks will be for half an hour</li>
                <li>• We will provide some leisure games such as carom etc to be played during the leisure period.</li>
                <li>• Company will also organize some snacks during the leisure period.</li>
              </ul>
              <h4 className="font-bold text-gray-900 mb-4 mt-8 text-lg">b) 9 and a half hour</h4>
              <ul className="space-y-3 text-gray-700">
                <li>• There will be only one break of 30 minutes for dinner.</li>
                <li>• Company will also organize some snacks.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Approved By */}
          <Card className="shadow-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-10 text-center">
              <div className="max-w-md mx-auto">
                <Badge className="bg-green-100 text-green-800 border border-green-200 mb-6 px-6 py-3 text-sm font-medium">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approved
                </Badge>
                <h3 className="text-xl font-bold text-gray-900 mb-3">G. Naga Anusha</h3>
                <p className="text-gray-600 text-sm">Managing Director (Operations & Finance)</p>
                <p className="text-gray-600 text-sm">Truerize IQ Strategic Solutions Pvt Ltd</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showInductionHandout && (
        <>
          {/* Leave Policy */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-blue-900">
                <FileText className="w-6 h-6" />
                Leave Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 text-gray-700">
                <li>1. The leave calendar is effective from January to December.</li>
                <li>2. Employees are eligible for 1 day leave every month, i.e. 12 leaves annually.</li>
                <li>3. Employees can avail maximum 3 days of leaves per quarter and it's on pro-rata basis.</li>
                <li>4. Employee who joins on or before 10th day of the month will be eligible for the leave in the respective month. Un availed leaves shall be neither carried forward nor enchased.</li>
                <li>5. If employee wants to avail leave, then he/she should send a mail to TRUERIZE HR Team checking for their Respective leave balance& eligibility. Based on the inputs provided by TRUERIZE HR, he/she can avail leave followed by the leave approval from Project Manager/Reporting Manager at the client place & forward the same to TRUERIZE HR Team.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-green-900">
                <CheckCircle className="w-6 h-6" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h4 className="font-bold text-gray-900 mb-3">Salary Process:</h4>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li>1. After onboarding at client location employee has to send a mail to TRUERIZE HR Team for time sheet format/process (hr.team@truerize.com).</li>
                <li>2. Employee has to send approved timesheet to timesheet@truerize.com every month on or before 5:00 PM on 2nd day of next month.</li>
                <li>3. If we receive approved timesheets before cut off time of the month then their salaries would be credited on or before 10th of every month.</li>
                <li>4. If employees who are sending timesheets after 3rd then their salaries will be credited on or before 15th of every month.</li>
                <li>5. If employees are sending timesheets after cutoff date then their salaries will be processed in mid of next month.</li>
                <li>6. Joinees after 25th will receive their first month salary along with their next month salary as an arrear.</li>
              </ul>
              <h4 className="font-bold text-gray-900 mb-3">Shift Allowances:</h4>
              <p className="text-gray-700">
                Employees are eligible for shift allowances provided the approvals from his/her project manager and the same will be credited to their salary accounts upon the payment received from client.
              </p>
            </CardContent>
          </Card>

          {/* BGV & Document Submission */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-purple-900">
                <BookOpen className="w-6 h-6" />
                BGV & Document Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 text-gray-700">
                <li>1. Employees need to submit relevant documents such as ID proof's, Educational, Employment etc…documents while he/she joining with TRUERIZE failing to which Joining shall be kept on hold.</li>
                <li>2. Employee's BG Verification will be done prior to his date of reporting to client location</li>
                <li>3. After on boarding employees has to share their contact number, client mail id, client employee id, project name, project manager name & contact number with hr.team@truerize.com</li>
                <li>4. Until the clearance from BGV Team Salary would not be credited.</li>
                <li>5. The first payroll date is 45days from the date of Joining.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Appraisal Process */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-yellow-900">
                <Clock className="w-6 h-6" />
                Appraisal Process
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 text-gray-700">
                <li>1. Employees are eligible for appraisal process upon the completion of one year from the date of joining and the same is subject to performance.</li>
                <li>2. TRUERIZE HR team will initiate the Appraisal process for the Employees who are in due by sending the Performance Review Form to the concerned Reporting Manager for his/her Inputs.</li>
                <li>3. Employees has to get it evaluated/filled from his/her concerned reporting manager/project manager and the same has to be forwarded to TRUERIZE HR Team by keeping his/her manager in the loop.</li>
                <li>4. Appraisals will be finalized based on the performance.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Medical Insurance Process */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-teal-900">
                <AlertTriangle className="w-6 h-6" />
                Medical Insurance Process
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 text-gray-700">
                <li>1. All TRUERIZE employees are benefited for Group Mediclaim for a sum insured of Rs. 200,000/- & Group Personal Accident for a sum insured of Rs. 500,000/- which shall be effective from the date of joining.</li>
                <li>2. The Softcopies of Mediclaim cards will be shared directly to your personnel mail ID's from Insurance team once generated, you can use the same for claims. (Note: Hard copies will not be provided)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Joining and Separation Process */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-red-900">
                <AlertTriangle className="w-6 h-6" />
                Joining and Separation Process
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 text-gray-700">
                <li>1. If employee resigns from his/her job responsibilities, it is mandatory to serve a notice period of 30 days.</li>
                <li>2. In case, where we receive an update from the client stating that you shall be relieved from your assigned responsibilities due to project closure / otherwise, a notice period as the Company deems fit on case to case basis shall be provided to you.</li>
                <li>3. In case of performance issues/misbehavior, then employee shall be terminated with immediate effect & in this scenario, client's decision shall be considered as final.</li>
                <li>4. Reporting to client place is completely based on Subject to Resource Availability</li>
              </ul>
            </CardContent>
          </Card>

          {/* Full & Final Settlement */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-indigo-900">
                <FileText className="w-6 h-6" />
                Full & Final Settlement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 text-gray-700">
                <li>1. Employees have to complete their exit formalities and have to share the authorized clearance certificate/form (format will be shared by HR Team) from their respective Reporting Manager on their last working day to HR Team.</li>
                <li>2. Also employee has to get their timesheet approved and has to forward the same mail to timesheet@truerize.com</li>
                <li>3. The employee's last month salary shall be considered as a Full and final settlement & would be processed after 60 days from the last working day in the 20th–25th payroll slot of the month.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Penalty Clause */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <AlertTriangle className="w-6 h-6" />
                Penalty Clause
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700">
                In case, employee doesn't report for work without any intimation for more than three working days, he/she shall be treated as absconding from the entrusted roles and responsibilities. During this scenario, TRUERIZE reserves the right to update the same in their database and also at National Skills Registry (NSR) and followed by legal initiation to recover the penalties levied by TRUERIZE clients' from those employees' towards their absconding.
              </p>
            </CardContent>
          </Card>

          {/* Escalation Matrix */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-orange-900">
                <Clock className="w-6 h-6" />
                Escalation Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700">
                Regarding salary/timesheet issues kindly send a mail to hr.team@truerize.com
              </p>
            </CardContent>
          </Card>

          {/* Salary Deductions */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-cyan-900">
                <CheckCircle className="w-6 h-6" />
                Salary Deductions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 text-gray-700">
                <li>1. There will be a Medical Insurance deduction, Professional Tax applicable every month.</li>
                <li>2. Income tax deduction will be applicable as per the Indian tax laws.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Declaration */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-gray-50">
            <CardContent className="p-8">
              <p className="text-gray-700 mb-6">
                I hereby declare that, I have read all the above information. I agree to abide to the disciplinary actions.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                  <div className="border-b border-gray-300 pb-1"></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Signature:</label>
                  <div className="border-b border-gray-300 pb-1"></div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Badge className="bg-green-100 text-green-800 border-green-200 mb-4 px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approved
                </Badge>
                <h3 className="text-lg font-bold text-gray-900 mb-2">G. Naga Anusha</h3>
                <p className="text-gray-600">Managing Director (Operations & Finance)</p>
                <p className="text-gray-600">Truerize IQ Strategic Solutions Pvt Ltd</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showSexualHarassment && (
        <>
          {/* Sexual Harassment */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-rose-900">
                <AlertTriangle className="w-6 h-6" />
                Sexual Harassment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 text-gray-700">
                <p>
                  The Sexual Harassment of Women at Workplace (Prevention, Prohibition and
                  Redressal) Act, 2013 (hereinafter referred to as the 'Act') is the law that provides
                  protection to women against sexual harassment at workplace in India and also details
                  the mechanism in place to deal with complaints of sexual harassment.
                </p>
                <p>
                  Sexual Harassment is defined under the Act to mean the following unwelcome acts or
                  behavior, amongst others:
                </p>
                <ul className="space-y-2 ml-6">
                  <li>a) Physical contact and advances; or</li>
                  <li>b) A demand or request for sexual favours; or</li>
                  <li>c) Making sexually coloured remarks; or</li>
                  <li>d) Showing pornography; or</li>
                  <li>e) Any other unwelcome physical, verbal or non-verbal conduct of sexual nature.</li>
                </ul>
                <p>
                  The Act provides for the constitution of an Internal Committee by every organization,
                  to which an aggrieved woman can complain to, if she is subjected to sexual
                  harassment.
                </p>
                <p>During the pendency of the inquiry before the Internal Committee, the employer can
                  grant the following reliefs:</p>
                <ul className="space-y-2 ml-6">
                  <li>a) Transfer the complainant or the respondent to any other workplace; or</li>
                  <li>b) Grant leave to the complainant for a period up to 3 months; or</li>
                  <li>c) Recommend to restrain the respondent from reporting on the work performance of
                    the aggrieved woman or writing her confidential report and assign the same to another
                    officer.</li>
                </ul>
                <p>
                  Under the Act, an inquiry has to be completed by the Internal Committee within 90
                  (ninety) days. On completion of the inquiry, if the Internal Committee comes to the
                  conclusion that the allegation of sexual harassment stands proved, then the Internal
                  Committee can direct the employer to take any one of the following actions:
                </p>
                <ul className="space-y-2 ml-6">
                  <li>a) Written Apology</li>
                  <li>b) Warning to the Respondent</li>
                  <li>c) Reprimand or Censure</li>
                  <li>d) Withholding of promotion or pay rise or increments</li>
                  <li>e) Terminating the Respondent from service</li>
                  <li>f) Undergoing a counselling session</li>
                  <li>g) Carrying out community service.</li>
                </ul>
                <div className="mt-8 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="mb-4">
                    I hereby acknowledge that I have read and understood the above note that details the
                    key features of the Act and the mechanism in place to deal with complaints of sexual
                    harassment. I further acknowledge that while the Act is restricted to sexual
                    harassment faced by women in a workplace in India, I am entitled to approach
                    appropriate forums under the law for any harassment that is not specifically covered
                    under the provisions of the Act.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                      <div className="border-b border-gray-300 pb-1"></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Place:</label>
                      <div className="border-b border-gray-300 pb-1"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                      <div className="border-b border-gray-300 pb-1"></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Signature:</label>
                      <div className="border-b border-gray-300 pb-1"></div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Badge className="bg-green-100 text-green-800 border-green-200 mb-4 px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approved
                    </Badge>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">G. Naga Anusha</h3>
                    <p className="text-gray-600">Managing Director (Operations & Finance)</p>
                    <p className="text-gray-600">Truerize IQ Strategic Solutions Pvt Ltd</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

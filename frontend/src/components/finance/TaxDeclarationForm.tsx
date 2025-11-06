'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface TaxDeclarationFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  onClose?: () => void;
}

export default function TaxDeclarationForm({ onSubmit, onClose }: TaxDeclarationFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      setLoading(true);
      await onSubmit(formData);
      if (onClose) onClose();
    } catch (error) {
      toast.error('Error submitting tax declaration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="financial_year">Financial Year</Label>
        <Select name="financial_year" required>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023-24">2023-24</SelectItem>
            <SelectItem value="2024-25">2024-25</SelectItem>
            <SelectItem value="2025-26">2025-26</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="total_income">Total Income</Label>
        <Input name="total_income" type="number" required />
      </div>
      <div>
        <Label htmlFor="taxable_income">Taxable Income</Label>
        <Input name="taxable_income" type="number" required />
      </div>
      <div>
        <Label htmlFor="tax_payable">Tax Payable</Label>
        <Input name="tax_payable" type="number" required />
      </div>
      <div>
        <Label htmlFor="documents">Documents</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="documents" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                <span>Upload files</span>
                <input id="documents" name="documents" type="file" multiple className="sr-only" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

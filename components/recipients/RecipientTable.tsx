'use client';

import { useState } from 'react';
import { Recipient } from '@/lib/types';
import { validateRecipient } from '@/lib/csv-utils';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface RecipientTableProps {
  recipients: Recipient[];
  onUpdate: (recipients: Recipient[]) => void;
}

export default function RecipientTable({ recipients, onUpdate }: RecipientTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Recipient>>({});

  const handleEdit = (recipient: Recipient) => {
    setEditingId(recipient.id);
    setEditData({
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      company: recipient.company,
      address1: recipient.address1,
      address2: recipient.address2,
      city: recipient.city,
      state: recipient.state,
      zip: recipient.zip,
      giftMessage: recipient.giftMessage,
    });
  };

  const handleSave = (id: string) => {
    const rowData: Record<string, string> = {
      first_name: editData.firstName || '',
      last_name: editData.lastName || '',
      company: editData.company || '',
      address1: editData.address1 || '',
      address2: editData.address2 || '',
      city: editData.city || '',
      state: editData.state || '',
      zip: editData.zip || '',
      gift_message: editData.giftMessage || '',
    };

    const { recipient, errors } = validateRecipient(rowData);
    if (recipient) {
      const updated = recipients.map(r => r.id === id ? recipient : r);
      onUpdate(updated);
      setEditingId(null);
      setEditData({});
    } else {
      alert(`Validation errors: ${errors.join(', ')}`);
    }
  };

  const handleRemove = (id: string) => {
    if (confirm('Remove this recipient?')) {
      const updated = recipients.filter(r => r.id !== id);
      onUpdate(updated);
    }
  };

  const validCount = recipients.filter(r => r.isValid).length;
  const invalidCount = recipients.length - validCount;

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-[#E98D3D] font-[var(--font-playfair)]">
          Recipients ({recipients.length})
        </h2>
        <div className="text-xs sm:text-sm flex flex-wrap gap-2 sm:gap-4">
          <span className="text-[#4CAF50]">✓ {validCount} valid</span>
          {invalidCount > 0 && (
            <span className="text-[#E53935]">✗ {invalidCount} invalid</span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="w-full text-xs sm:text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-[#8B7355]/30">
                  <th className="text-left p-2 font-semibold text-[#E98D3D]">Status</th>
                  <th className="text-left p-2 font-semibold text-[#E98D3D]">Name</th>
                  <th className="text-left p-2 font-semibold text-[#E98D3D] hidden sm:table-cell">Company</th>
                  <th className="text-left p-2 font-semibold text-[#E98D3D]">Address</th>
                  <th className="text-left p-2 font-semibold text-[#E98D3D]">City, State ZIP</th>
                  <th className="text-left p-2 font-semibold text-[#E98D3D]">Actions</th>
                </tr>
              </thead>
              <tbody>
            {recipients.map((recipient) => (
              <tr key={recipient.id} className="border-b border-[#8B7355]/10">
                <td className="p-2">
                  {recipient.isValid ? (
                    <span className="text-[#4CAF50]">✓</span>
                  ) : (
                    <span className="text-[#E53935]">✗</span>
                  )}
                </td>
                <td className="p-2">
                  {editingId === recipient.id ? (
                    <div className="space-y-1">
                      <Input
                        value={editData.firstName || ''}
                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                        className="text-xs p-1"
                        placeholder="First"
                        autoComplete="given-name"
                        inputMode="text"
                      />
                      <Input
                        value={editData.lastName || ''}
                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                        className="text-xs p-1"
                        placeholder="Last"
                        autoComplete="family-name"
                        inputMode="text"
                      />
                    </div>
                  ) : (
                    <span>{recipient.firstName} {recipient.lastName}</span>
                  )}
                </td>
                <td className="p-2 hidden sm:table-cell">
                  {editingId === recipient.id ? (
                    <Input
                      value={editData.company || ''}
                      onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                      className="text-xs p-1"
                      placeholder="Company"
                      autoComplete="organization"
                      inputMode="text"
                    />
                  ) : (
                    <span>{recipient.company || '-'}</span>
                  )}
                </td>
                <td className="p-2">
                  {editingId === recipient.id ? (
                    <div className="space-y-1">
                      <Input
                        value={editData.address1 || ''}
                        onChange={(e) => setEditData({ ...editData, address1: e.target.value })}
                        className="text-xs p-1"
                        placeholder="Address 1"
                        autoComplete="street-address"
                        inputMode="text"
                      />
                      <Input
                        value={editData.address2 || ''}
                        onChange={(e) => setEditData({ ...editData, address2: e.target.value })}
                        className="text-xs p-1"
                        placeholder="Address 2"
                        autoComplete="address-line2"
                        inputMode="text"
                      />
                    </div>
                  ) : (
                    <span>
                      {recipient.address1}
                      {recipient.address2 && <br />}
                      {recipient.address2}
                    </span>
                  )}
                </td>
                <td className="p-2">
                  {editingId === recipient.id ? (
                    <div className="space-y-1">
                      <Input
                        value={editData.city || ''}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        className="text-xs p-1"
                        placeholder="City"
                        autoComplete="address-level2"
                        inputMode="text"
                      />
                      <div className="flex gap-1">
                        <Input
                          value={editData.state || ''}
                          onChange={(e) => setEditData({ ...editData, state: e.target.value.toUpperCase() })}
                          className="text-xs p-1 w-16"
                          placeholder="ST"
                          maxLength={2}
                          autoComplete="address-level1"
                          inputMode="text"
                        />
                        <Input
                          value={editData.zip || ''}
                          onChange={(e) => setEditData({ ...editData, zip: e.target.value })}
                          className="text-xs p-1 flex-1"
                          placeholder="ZIP"
                          autoComplete="postal-code"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  ) : (
                    <span>{recipient.city}, {recipient.state} {recipient.zip}</span>
                  )}
                </td>
                <td className="p-2">
                  {editingId === recipient.id ? (
                    <div className="flex flex-col sm:flex-row gap-1">
                      <Button
                        variant="secondary"
                        onClick={() => handleSave(recipient.id)}
                        className="px-2 py-1.5 text-xs min-h-[36px]"
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingId(null);
                          setEditData({});
                        }}
                        className="px-2 py-1.5 text-xs min-h-[36px]"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-1">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(recipient)}
                        className="px-2 py-1.5 text-xs min-h-[36px]"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleRemove(recipient.id)}
                        className="px-2 py-1.5 text-xs min-h-[36px]"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {recipients.length === 0 && (
        <p className="text-center text-xs sm:text-sm text-[#8B7355] py-6 sm:py-8">
          No recipients uploaded yet. Upload a CSV file to get started.
        </p>
      )}
    </Card>
  );
}

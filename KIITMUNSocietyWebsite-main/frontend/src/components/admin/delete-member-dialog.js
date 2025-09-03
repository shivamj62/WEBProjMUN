'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function DeleteMemberDialog({ 
  member, 
  isOpen, 
  onClose, 
  onDelete 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await onDelete(member.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete member:', error);
      setError(error.message || 'Failed to delete member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-900 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
            Delete Member
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to delete <span className="font-semibold text-white">{member?.name}</span> ({member?.email})?
            <br />
            <br />
            This action cannot be undone. This will permanently remove the member's account and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-800">
            {error}
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Member'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

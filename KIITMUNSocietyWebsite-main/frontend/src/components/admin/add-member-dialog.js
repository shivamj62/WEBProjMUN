'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';

export default function AddMemberDialog({ 
  isOpen, 
  onClose, 
  onAdd 
}) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'member'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onAdd(formData);
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        role: 'member'
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to add member:', error);
      setErrors({ 
        submit: error.message || 'Failed to add member. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      email: '',
      name: '',
      role: 'member'
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Add New Member
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new member to the allowed emails list. They will be able to create an account with this information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-email" className="text-gray-300">Email</Label>
            <Input
              id="add-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              placeholder="member@example.com"
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-name" className="text-gray-300">Name</Label>
            <Input
              id="add-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-400 text-sm">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-role" className="text-gray-300">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="member" className="text-white hover:bg-gray-700">Member</SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-gray-700">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-red-400 text-sm">{errors.role}</p>
            )}
          </div>

          {errors.submit && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-800">
              {errors.submit}
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="ghost"
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Member'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

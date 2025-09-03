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
import { Loader2 } from 'lucide-react';

export default function EditMemberDialog({ 
  member, 
  isOpen, 
  onClose, 
  onSave 
}) {
  const [formData, setFormData] = useState({
    email: member?.email || '',
    name: member?.name || '',
    role: member?.role || 'member',
    password: ''
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
      const updateData = {
        email: formData.email,
        name: formData.name,
        role: formData.role
      };
      
      // Only include password if it's provided
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }
      
      await onSave(member.id, updateData);
      onClose();
    } catch (error) {
      console.error('Failed to update member:', error);
      setErrors({ 
        submit: error.message || 'Failed to update member. Please try again.' 
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

  // Reset form when member changes
  useState(() => {
    if (member) {
      setFormData({
        email: member.email || '',
        name: member.name || '',
        role: member.role || 'member',
        password: ''
      });
      setErrors({});
    }
  }, [member]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Member</DialogTitle>
          <DialogDescription className="text-gray-400">
            Make changes to the member's profile. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
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
            <Label htmlFor="name" className="text-gray-300">Name</Label>
            <Input
              id="name"
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
            <Label htmlFor="role" className="text-gray-300">Role</Label>
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              Password 
              <span className="text-gray-500 text-sm ml-1">(leave blank to keep current)</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              placeholder="Enter new password"
            />
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password}</p>
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
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="ghost"
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

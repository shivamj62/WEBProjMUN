'use client';

import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

const PasswordCell = ({ password }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-300 font-mono text-sm">
        {isVisible ? password : '••••••••'}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
      >
        {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </Button>
    </div>
  );
};

export const createMembersColumns = (onEdit, onDelete) => [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="font-medium text-white">
        {row.getValue('email')}
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="text-gray-300">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role');
      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          role === 'admin' 
            ? 'bg-red-900/50 text-red-300 border border-red-800' 
            : 'bg-blue-900/50 text-blue-300 border border-blue-800'
        }`}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </div>
      );
    },
  },
  {
    accessorKey: 'password',
    header: 'Password',
    cell: ({ row }) => (
      <PasswordCell password={row.original.password || 'No password set'} />
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return (
        <div className="text-gray-300 text-sm">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const member = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
            <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem 
              onClick={() => onEdit(member)}
              className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit member
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(member)}
              className="text-red-400 hover:bg-red-900/50 hover:text-red-300 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

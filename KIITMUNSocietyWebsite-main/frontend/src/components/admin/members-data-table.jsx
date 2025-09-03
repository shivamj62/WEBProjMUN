'use client';

import { useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UserPlus, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedApiCall, API_ENDPOINTS } from '@/lib/api';
import { createMembersColumns } from './members-columns';
import EditMemberDialog from './edit-member-dialog';
import DeleteMemberDialog from './delete-member-dialog';
import AddMemberDialog from './add-member-dialog';

export default function MembersDataTable() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  // Dialog states
  const [editMember, setEditMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { showPopup } = useAuth();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await authenticatedApiCall(
        `${API_ENDPOINTS.ADMIN.MEMBERS}?${params}`,
        { method: 'GET' }
      );

      if (response.success && response.data) {
        setMembers(response.data.members || []);
        setTotalMembers(response.data.total || 0);
        setTotalPages(response.data.total_pages || 0);
      } else {
        throw new Error(response.error || 'Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      showPopup(`Failed to fetch members: ${error.message}`, 'error');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when pagination/search changes
  useEffect(() => {
    fetchMembers();
  }, [pagination.pageIndex, pagination.pageSize, searchQuery]);

  const handleEdit = (member) => {
    setEditMember(member);
  };

  const handleDelete = (member) => {
    setDeleteMember(member);
  };

  const handleSaveMember = async (memberId, memberData) => {
    try {
      const response = await authenticatedApiCall(
        API_ENDPOINTS.ADMIN.MEMBER_UPDATE(memberId),
        {
          method: 'PUT',
          body: memberData, // apiCall will auto-stringify this
        }
      );

      if (response.success) {
        showPopup('Member updated successfully!', 'success');
        await fetchMembers(); // Refresh the table
      } else {
        throw new Error(response.error || 'Failed to update member');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      throw error; // Re-throw to be handled by the dialog
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      const response = await authenticatedApiCall(
        API_ENDPOINTS.ADMIN.MEMBER_DELETE(memberId),
        { method: 'DELETE' }
      );

      if (response.success) {
        showPopup('Member deleted successfully!', 'success');
        await fetchMembers(); // Refresh the table
      } else {
        throw new Error(response.error || 'Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error; // Re-throw to be handled by the dialog
    }
  };

  const handleAddMember = async (memberData) => {
    try {
      const response = await authenticatedApiCall(
        API_ENDPOINTS.ADMIN.ADD_EMAIL,
        {
          method: 'POST',
          body: memberData, // apiCall will auto-stringify this
        }
      );

      if (response.success) {
        showPopup('Member added to allowed emails successfully!', 'success');
        await fetchMembers(); // Refresh the table
      } else {
        throw new Error(response.error || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      throw error; // Re-throw to be handled by the dialog
    }
  };

  const columns = createMembersColumns(handleEdit, handleDelete);

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Members Management</h1>
            <p className="text-gray-300 text-lg">
              Manage member accounts and permissions • {totalMembers} total members
            </p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-gray-800/70 border-gray-600 text-white placeholder:text-gray-400 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchMembers}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 px-6 py-3 rounded-lg transition-all duration-200"
          >
            <RefreshCw className={`mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-700 bg-gray-800/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-200 font-semibold py-4 px-6">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center bg-gray-900/30">
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-3 h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-gray-300 text-lg">Loading members...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-gray-700 hover:bg-gray-800/40 transition-colors duration-200"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-200 py-4 px-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center bg-gray-900/30">
                  <div className="text-gray-400 text-lg">
                    {searchQuery ? 'No members found matching your search.' : 'No members found.'}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-300 text-base">
            {totalMembers > 0 && (
              <>
                Showing <span className="font-medium text-white">{pagination.pageIndex * pagination.pageSize + 1}</span> to{' '}
                <span className="font-medium text-white">{Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalMembers)}</span> of{' '}
                <span className="font-medium text-white">{totalMembers}</span> members
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded-lg transition-all duration-200"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded-lg transition-all duration-200"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <EditMemberDialog
        member={editMember}
        isOpen={!!editMember}
        onClose={() => setEditMember(null)}
        onSave={handleSaveMember}
      />

      <DeleteMemberDialog
        member={deleteMember}
        isOpen={!!deleteMember}
        onClose={() => setDeleteMember(null)}
        onDelete={handleDeleteMember}
      />

      <AddMemberDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddMember}
      />
    </div>
  );
}

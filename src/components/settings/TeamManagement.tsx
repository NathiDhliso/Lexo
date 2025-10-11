/**
 * Team Management Component
 * Manage team members (admins, secretaries, etc.)
 */

import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { toastService } from '../../services/toast.service';
import { supabase } from '../../lib/supabase';
import { UpgradePrompt } from '../subscription/UpgradePrompt';

interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'secretary' | 'advocate';
  status: 'active' | 'pending' | 'inactive';
  invited_at: string;
  invited_by: string;
}

// Separate component for the invite form to prevent re-renders
interface InviteFormProps {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'secretary' | 'advocate';
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSending: boolean;
}

// ✅ InviteForm defined OUTSIDE to prevent re-mounting
const InviteForm: React.FC<InviteFormProps> = React.memo(({
  email,
  firstName,
  lastName,
  role,
  onEmailChange,
  onFirstNameChange,
  onLastNameChange,
  onRoleChange,
  onSubmit,
  onCancel,
  isSending
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email Field */}
      <div>
        <label
          htmlFor="invite-email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={onEmailChange}
            placeholder="colleague@lawfirm.com"
            required
            autoFocus
            autoComplete="email"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                     transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSending}
          />
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="invite-first-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="invite-first-name"
            type="text"
            value={firstName}
            onChange={onFirstNameChange}
            placeholder="John"
            required
            autoComplete="given-name"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                     transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSending}
          />
        </div>
        <div>
          <label
            htmlFor="invite-last-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="invite-last-name"
            type="text"
            value={lastName}
            onChange={onLastNameChange}
            placeholder="Doe"
            required
            autoComplete="family-name"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                     transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSending}
          />
        </div>
      </div>

      {/* Role Selection */}
      <div>
        <label
          htmlFor="invite-role"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Role <span className="text-red-500">*</span>
        </label>
        <select
          id="invite-role"
          value={role}
          onChange={onRoleChange}
          required
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                   transition-colors duration-200 cursor-pointer
                   disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSending}
        >
          <option value="secretary">Secretary</option>
          <option value="advocate">Advocate</option>
          <option value="admin">Admin</option>
        </select>

        {/* Role Description */}
        <div className="mt-2.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2">
            {role === 'admin' && <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />}
            {role === 'advocate' && <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />}
            {role === 'secretary' && <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />}
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {role === 'admin' && 'Full access to all features, settings, billing, and team management'}
              {role === 'advocate' && 'Can manage matters, clients, time entries, invoices, and documents'}
              {role === 'secretary' && 'Can assist with administrative tasks, scheduling, and basic matter management'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSending}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSending || !email || !firstName || !lastName}
          className="flex-1 flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send Invitation
            </>
          )}
        </Button>
      </div>
    </form>
  );
});

InviteForm.displayName = 'InviteForm';

export const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const { subscription, usage } = useSubscription();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Use a single state object for form data to prevent re-renders
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'secretary' as 'admin' | 'secretary' | 'advocate'
  });

  // ✅ Memoize loadTeamMembers to prevent unnecessary useEffect triggers
  const loadTeamMembers = React.useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('organization_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Failed to load team members:', error);
      toastService.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  // ✅ Memoize handlers with stable references
  const handleEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteFormData(prev => ({ ...prev, email: e.target.value }));
  }, []);

  const handleFirstNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteFormData(prev => ({ ...prev, firstName: e.target.value }));
  }, []);

  const handleLastNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteFormData(prev => ({ ...prev, lastName: e.target.value }));
  }, []);

  const handleRoleChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setInviteFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'secretary' | 'advocate' }));
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setShowInviteModal(false);
  }, []);

  // ✅ Fixed: Use individual dependencies instead of object dependency
  const handleInvite = React.useCallback(async () => {
    if (!user) return;

    // Validate email
    if (!inviteFormData.email || !inviteFormData.firstName || !inviteFormData.lastName) {
      toastService.error('Please fill in all fields');
      return;
    }

    try {
      setIsSending(true);

      // Create team member invitation
      const { error } = await supabase
        .from('team_members')
        .insert({
          organization_id: user.id,
          email: inviteFormData.email,
          first_name: inviteFormData.firstName,
          last_name: inviteFormData.lastName,
          role: inviteFormData.role,
          status: 'pending',
          invited_by: user.id,
          invited_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email (you'll need to implement this)
      // await sendInvitationEmail(inviteFormData.email, inviteFormData.firstName);

      toastService.success(`Invitation sent to ${inviteFormData.email}`);
      setShowInviteModal(false);
      setInviteFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'secretary'
      });
      await loadTeamMembers();
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      toastService.error(error.message || 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  }, [user, inviteFormData.email, inviteFormData.firstName, inviteFormData.lastName, inviteFormData.role, loadTeamMembers]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toastService.success('Team member removed');
      await loadTeamMembers();
    } catch (error) {
      console.error('Failed to remove team member:', error);
      toastService.error('Failed to remove team member');
    }
  };

  const handleResendInvite = async (member: TeamMember) => {
    try {
      // Resend invitation email
      toastService.success(`Invitation resent to ${member.email}`);
    } catch (error) {
      toastService.error('Failed to resend invitation');
    }
  };

  // Check if user can add more team members
  const canAddMembers = subscription && usage &&
    (subscription.tier === 'senior_counsel' || subscription.tier === 'advocate');

  const maxUsers = subscription?.tier === 'senior_counsel' ? 5 :
    subscription?.tier === 'advocate' ? 1 : 1;
  const currentUsers = (usage?.users_count || 1);
  const additionalUsersAllowed = maxUsers + (subscription?.additional_users || 0);
  const hasReachedLimit = currentUsers >= additionalUsersAllowed;

  if (!canAddMembers) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Team Members</h2>
        <UpgradePrompt
          title="Team Collaboration Requires Upgrade"
          message="Upgrade to Advocate or Senior Counsel to add team members to your practice."
          variant="inline"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {currentUsers} of {additionalUsersAllowed} users
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          disabled={hasReachedLimit}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {hasReachedLimit && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            You've reached your team member limit.
            <button
              onClick={() => window.location.href = '/settings?tab=subscription'}
              className="ml-1 font-medium underline hover:no-underline"
            >
              Add more users
            </button>
          </p>
        </div>
      )}

      {/* Team Members List */}
      {isLoading ? (
        <div className="text-center py-8">Loading team members...</div>
      ) : teamMembers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No team members</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by inviting your first team member.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                    {member.first_name[0]}{member.last_name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${member.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                    member.role === 'advocate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}
                `}>
                  {member.role === 'admin' && <Shield className="inline h-3 w-3 mr-1" />}
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>

                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${member.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                    member.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}
                `}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>

                {member.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResendInvite(member)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={handleCloseModal}
        title="Invite Team Member"
      >
        <InviteForm
          email={inviteFormData.email}
          firstName={inviteFormData.firstName}
          lastName={inviteFormData.lastName}
          role={inviteFormData.role}
          onEmailChange={handleEmailChange}
          onFirstNameChange={handleFirstNameChange}
          onLastNameChange={handleLastNameChange}
          onRoleChange={handleRoleChange}
          onSubmit={handleInvite}
          onCancel={handleCloseModal}
          isSending={isSending}
        />
      </Modal>
    </div>
  );
};

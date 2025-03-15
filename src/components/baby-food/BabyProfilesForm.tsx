
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Baby } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BabyProfile {
  id: string;
  name: string;
  age_in_months: number;
}

const BabyProfilesForm = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<BabyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProfile, setNewProfile] = useState({ name: '', age_in_months: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('baby_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
          
        if (error) throw error;
        
        setProfiles(data as BabyProfile[]);
      } catch (error) {
        console.error('Error fetching baby profiles:', error);
        toast.error('Failed to load baby profiles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfiles();
  }, [user]);

  const handleAddProfile = async () => {
    if (!user) {
      toast.error('You must be logged in to add a profile');
      return;
    }
    
    if (!newProfile.name.trim() || !newProfile.age_in_months.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const age = parseInt(newProfile.age_in_months);
    if (isNaN(age) || age < 0 || age > 36) {
      toast.error('Please enter a valid age between 0 and 36 months');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('baby_profiles')
        .insert({
          user_id: user.id,
          name: newProfile.name.trim(),
          age_in_months: age
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setProfiles([...profiles, data as BabyProfile]);
      setNewProfile({ name: '', age_in_months: '' });
      setShowAddForm(false);
      toast.success('Baby profile added!');
    } catch (error) {
      console.error('Error adding baby profile:', error);
      toast.error('Failed to add baby profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('baby_profiles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setProfiles(profiles.filter(profile => profile.id !== id));
      toast.success('Baby profile deleted');
    } catch (error) {
      console.error('Error deleting baby profile:', error);
      toast.error('Failed to delete baby profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAge = async (id: string, newAge: string) => {
    if (!user) return;
    
    const age = parseInt(newAge);
    if (isNaN(age) || age < 0 || age > 36) {
      toast.error('Please enter a valid age between 0 and 36 months');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('baby_profiles')
        .update({ age_in_months: age })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setProfiles(profiles.map(profile => 
        profile.id === id ? { ...profile, age_in_months: age } : profile
      ));
      
      toast.success('Baby age updated');
    } catch (error) {
      console.error('Error updating baby age:', error);
      toast.error('Failed to update baby age');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Baby className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Baby Profiles</h3>
        </div>
        
        {!showAddForm && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddForm(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Baby
          </Button>
        )}
      </div>
      
      {showAddForm && (
        <div className="bg-muted/20 p-4 rounded-lg border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="baby-name">Baby's Name</Label>
              <Input
                id="baby-name"
                value={newProfile.name}
                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                placeholder="Enter baby's name"
              />
            </div>
            <div>
              <Label htmlFor="baby-age">Age (months)</Label>
              <Input
                id="baby-age"
                type="number"
                min="0"
                max="36"
                value={newProfile.age_in_months}
                onChange={(e) => setNewProfile({ ...newProfile, age_in_months: e.target.value })}
                placeholder="e.g., 12"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setNewProfile({ name: '', age_in_months: '' });
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              size="sm"
              onClick={handleAddProfile}
              disabled={loading}
            >
              Add Profile
            </Button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : profiles.length > 0 ? (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              className="flex items-center justify-between p-3 bg-white rounded-lg border"
            >
              <div className="font-medium">{profile.name}</div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`age-${profile.id}`} className="text-sm text-muted-foreground whitespace-nowrap">
                    Age:
                  </Label>
                  <Input
                    id={`age-${profile.id}`}
                    type="number"
                    min="0"
                    max="36"
                    value={profile.age_in_months}
                    onChange={(e) => handleUpdateAge(profile.id, e.target.value)}
                    className="w-16 h-8 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">months</span>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Baby Profile</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {profile.name}'s profile? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteProfile(profile.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No baby profiles added yet</p>
        </div>
      )}
    </div>
  );
};

export default BabyProfilesForm;

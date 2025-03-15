
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calendar, Baby } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInMonths, parseISO } from 'date-fns';

interface BabyProfile {
  id?: string;
  name: string;
  birth_date: string;
}

const BabyProfilesForm: React.FC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<BabyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProfile, setNewProfile] = useState<BabyProfile>({ name: '', birth_date: '' });

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('baby_profiles')
        .select('id, name, age_in_months')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;

      // Convert age_in_months to birth_date format
      const profilesWithBirthDate = data.map(profile => {
        // Calculate approximate birth date based on age in months
        const currentDate = new Date();
        const birthDate = new Date();
        birthDate.setMonth(currentDate.getMonth() - profile.age_in_months);
        
        return {
          id: profile.id,
          name: profile.name,
          birth_date: format(birthDate, 'yyyy-MM-dd')
        };
      });

      setProfiles(profilesWithBirthDate);
    } catch (error) {
      console.error('Error fetching baby profiles:', error);
      toast.error('Failed to load baby profiles');
    } finally {
      setLoading(false);
    }
  };

  const calculateAgeInMonths = (birthDate: string): number => {
    return differenceInMonths(new Date(), parseISO(birthDate));
  };

  const handleAddProfile = async () => {
    if (!newProfile.name.trim() || !newProfile.birth_date) {
      toast.error('Please enter a name and birth date for your baby');
      return;
    }

    const ageInMonths = calculateAgeInMonths(newProfile.birth_date);
    
    if (ageInMonths < 0) {
      toast.error('Birth date cannot be in the future');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('baby_profiles')
        .insert([
          { 
            user_id: user?.id, 
            name: newProfile.name.trim(),
            age_in_months: ageInMonths 
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add the birth_date property to the new profile
      const birthDate = newProfile.birth_date;
      
      setProfiles([...profiles, { 
        id: data.id, 
        name: data.name,
        birth_date: birthDate
      }]);
      
      setNewProfile({ name: '', birth_date: '' });
      toast.success('Baby profile added!');
    } catch (error) {
      console.error('Error adding baby profile:', error);
      toast.error('Failed to add baby profile');
    }
  };

  const handleDeleteProfile = async (id?: string) => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('baby_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProfiles(profiles.filter(profile => profile.id !== id));
      toast.success('Baby profile removed');
    } catch (error) {
      console.error('Error deleting baby profile:', error);
      toast.error('Failed to delete baby profile');
    }
  };

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Baby className="mr-2 h-5 w-5" />
          Baby Profiles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {profiles.map((profile) => (
              <div 
                key={profile.id}
                className="flex justify-between items-center p-3 bg-background border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div>
                  <h3 className="font-bold">{profile.name}</h3>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="inline-block mr-1 h-3 w-3" /> 
                    Birth date: {format(parseISO(profile.birth_date), 'MMM d, yyyy')} 
                    <span className="ml-2">({calculateAgeInMonths(profile.birth_date)} months old)</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t-2 border-muted">
            <h3 className="font-bold mb-3">Add New Baby</h3>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Baby's name"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                  className="border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium mb-1">Birth Date</label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newProfile.birth_date}
                  onChange={(e) => setNewProfile({...newProfile, birth_date: e.target.value})}
                  className="border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <Button
                onClick={handleAddProfile}
                className="w-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all" 
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Baby
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BabyProfilesForm;

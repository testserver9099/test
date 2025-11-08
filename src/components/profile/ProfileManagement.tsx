import React, { useState } from 'react';
import { useProfile } from '@/lib/profile-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { IconEdit, IconTrash, IconDownload, IconUpload } from '@tabler/icons-react';
import { exportData, importData } from '@/lib/data-management';

export function ProfileManagement() {
  const { profiles, selectedProfileId, selectProfile, removeProfile } = useProfile();
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');

  const handleEditClick = (profileId: string, currentName: string) => {
    setEditingProfileId(profileId);
    setNewProfileName(currentName);
  };

  const handleSaveName = (profileId: string) => {
    // In a real scenario, you'd have an updateProfileName function in your context
    // For now, we'll just log and reset

    setEditingProfileId(null);
    setNewProfileName('');
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importData(file);
        alert('Data imported successfully!');
        // Reload page to reflect changes from localStorage
        window.location.reload(); 
      } catch (error: any) {
        alert(`Error importing data: ${error.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <p className="text-muted-foreground">No profiles added yet. Go to Home to add one!</p>
            ) : (
              profiles.map(profile => (
                <div key={profile.id} className="flex items-center justify-between p-3 border rounded-md">
                  {editingProfileId === profile.id ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <Input
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleSaveName(profile.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingProfileId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <span 
                      className={`cursor-pointer ${selectedProfileId === profile.id ? 'font-bold text-primary' : ''}`}
                      onClick={() => selectProfile(profile.id)}
                    >
                      {profile.name} ({profile.profileUrl})
                    </span>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(profile.id, profile.name)}>
                      <IconEdit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeProfile(profile.id)}>
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button onClick={exportData} className="w-full">
            <IconDownload size={16} className="mr-2" /> Export Data
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <IconUpload size={16} className="mr-2" /> Import Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Data</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="file" className="text-right">
                    JSON File
                  </Label>
                  <Input id="file" type="file" accept=".json" onChange={handleFileImport} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" form="import-form" disabled>Import</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

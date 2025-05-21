
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Device {
  id: string;
  name: string;
  code: string;
  status: 'online' | 'offline';
  lastSeen: string;
  playlist: string;
  playlistId?: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string | null;
}

const Devices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceCode, setNewDeviceCode] = useState("");
  const [newDeviceDescription, setNewDeviceDescription] = useState("");
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  
  // Playlist linking
  const [linkPlaylistDialogOpen, setLinkPlaylistDialogOpen] = useState(false);
  const [deviceToLink, setDeviceToLink] = useState<Device | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  // Fetch devices from Supabase
  useEffect(() => {
    fetchDevices();
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoadingPlaylists(true);
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('name');

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      toast({
        title: "Erro ao carregar playlists",
        description: "Não foi possível carregar a lista de playlists.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('devices')
        .select('*, device_playlists(playlist_id, playlists(id, name))')
        .order('name');

      if (error) {
        throw error;
      }

      // Format devices data for display
      const formattedDevices = data.map(device => ({
        id: device.id,
        name: device.name,
        code: device.code,
        status: device.status || 'offline',
        lastSeen: device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Nunca',
        playlist: device.device_playlists?.[0]?.playlists?.name || 'Nenhuma',
        playlistId: device.device_playlists?.[0]?.playlist_id || undefined
      }));

      setDevices(formattedDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast({
        title: "Erro ao carregar dispositivos",
        description: "Não foi possível carregar a lista de dispositivos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new device
  const handleAddDevice = async () => {
    try {
      if (!newDeviceName || !newDeviceCode) {
        toast({
          title: "Campos obrigatórios",
          description: "Nome e código do dispositivo são obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('devices')
        .insert([
          {
            name: newDeviceName,
            code: newDeviceCode,
            description: newDeviceDescription,
            status: 'offline',
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Dispositivo adicionado",
        description: `${newDeviceName} foi cadastrado com sucesso.`,
      });

      // Add new device to the list
      if (data && data.length > 0) {
        setDevices([...devices, {
          id: data[0].id,
          name: data[0].name,
          code: data[0].code,
          status: 'offline',
          lastSeen: 'Nunca',
          playlist: 'Nenhuma'
        }]);
      }

      // Reset form and close dialog
      setNewDeviceName("");
      setNewDeviceCode("");
      setNewDeviceDescription("");
      setOpenDialog(false);
    } catch (error) {
      console.error("Error adding device:", error);
      toast({
        title: "Erro ao adicionar dispositivo",
        description: "Não foi possível cadastrar o dispositivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a device
  const confirmDeleteDevice = (device: Device) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;
    
    try {
      // First delete any related playlist links
      const { error: linkError } = await supabase
        .from('device_playlists')
        .delete()
        .eq('device_id', deviceToDelete.id);
      
      if (linkError) {
        throw linkError;
      }
      
      // Then delete the device itself
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceToDelete.id);
      
      if (error) {
        throw error;
      }
      
      // Remove from local state
      setDevices(devices.filter(d => d.id !== deviceToDelete.id));
      
      toast({
        title: "Dispositivo excluído",
        description: `${deviceToDelete.name} foi excluído com sucesso.`,
      });
      
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    } catch (error) {
      console.error("Error deleting device:", error);
      toast({
        title: "Erro ao excluir dispositivo",
        description: "Não foi possível excluir o dispositivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  // Handle linking playlist to device
  const openLinkPlaylistDialog = (device: Device) => {
    setDeviceToLink(device);
    setSelectedPlaylistId(device.playlistId || "");
    setLinkPlaylistDialogOpen(true);
  };
  
  const handleLinkPlaylist = async () => {
    if (!deviceToLink) return;
    
    try {
      // First, remove any existing playlist links
      await supabase
        .from('device_playlists')
        .delete()
        .eq('device_id', deviceToLink.id);
      
      // If a playlist was selected, create a new link
      if (selectedPlaylistId) {
        const { error } = await supabase
          .from('device_playlists')
          .insert([
            {
              device_id: deviceToLink.id,
              playlist_id: selectedPlaylistId,
              is_active: true
            }
          ]);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Playlist vinculada",
          description: `Playlist vinculada ao dispositivo ${deviceToLink.name} com sucesso.`,
        });
      } else {
        toast({
          title: "Vínculo removido",
          description: `O dispositivo ${deviceToLink.name} não está mais vinculado a nenhuma playlist.`,
        });
      }
      
      // Refresh the devices list
      fetchDevices();
      setLinkPlaylistDialogOpen(false);
      setDeviceToLink(null);
      setSelectedPlaylistId("");
    } catch (error) {
      console.error("Error linking playlist:", error);
      toast({
        title: "Erro ao vincular playlist",
        description: "Não foi possível vincular a playlist ao dispositivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const filteredDevices = devices.filter(device => 
    device.name.toLowerCase().includes(search.toLowerCase()) || 
    device.code.toLowerCase().includes(search.toLowerCase())
  );

  const statusIndicator = (status: string) => {
    return (
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"}`}></div>
        <span>{status === "online" ? "Online" : "Offline"}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando dispositivos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dispositivos</h2>
          <p className="text-muted-foreground">
            Gerencie seus displays e dispositivos de exibição.
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Dispositivo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Dispositivo</DialogTitle>
              <DialogDescription>
                Cadastre um novo dispositivo para exibição de conteúdo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  placeholder="TV Recepção"
                  className="col-span-3"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Código
                </Label>
                <Input
                  id="code"
                  placeholder="REC001"
                  className="col-span-3"
                  value={newDeviceCode}
                  onChange={(e) => setNewDeviceCode(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="description"
                  placeholder="Descrição do dispositivo"
                  className="col-span-3"
                  value={newDeviceDescription}
                  onChange={(e) => setNewDeviceDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenDialog(false)} variant="outline">Cancelar</Button>
              <Button onClick={handleAddDevice}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar dispositivos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos ({devices.length})</TabsTrigger>
          <TabsTrigger value="online">Online ({devices.filter(d => d.status === "online").length})</TabsTrigger>
          <TabsTrigger value="offline">Offline ({devices.filter(d => d.status === "offline").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Conexão</TableHead>
                  <TableHead>Playlist</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum dispositivo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.code}</TableCell>
                      <TableCell>{statusIndicator(device.status)}</TableCell>
                      <TableCell>{device.lastSeen}</TableCell>
                      <TableCell>{device.playlist}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/devices/${device.id}`)}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openLinkPlaylistDialog(device)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => confirmDeleteDevice(device)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="online">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Conexão</TableHead>
                  <TableHead>Playlist</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices
                  .filter((device) => device.status === "online")
                  .length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum dispositivo online encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices
                    .filter((device) => device.status === "online")
                    .map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">{device.name}</TableCell>
                        <TableCell>{device.code}</TableCell>
                        <TableCell>{statusIndicator(device.status)}</TableCell>
                        <TableCell>{device.lastSeen}</TableCell>
                        <TableCell>{device.playlist}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/devices/${device.id}`)}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openLinkPlaylistDialog(device)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => confirmDeleteDevice(device)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="offline">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Conexão</TableHead>
                  <TableHead>Playlist</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices
                  .filter((device) => device.status === "offline")
                  .length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum dispositivo offline encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices
                    .filter((device) => device.status === "offline")
                    .map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">{device.name}</TableCell>
                        <TableCell>{device.code}</TableCell>
                        <TableCell>{statusIndicator(device.status)}</TableCell>
                        <TableCell>{device.lastSeen}</TableCell>
                        <TableCell>{device.playlist}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/devices/${device.id}`)}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openLinkPlaylistDialog(device)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => confirmDeleteDevice(device)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o dispositivo {deviceToDelete?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeviceToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDevice} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Link Playlist Dialog */}
      <Dialog open={linkPlaylistDialogOpen} onOpenChange={setLinkPlaylistDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vincular Playlist</DialogTitle>
            <DialogDescription>
              Selecione uma playlist para vincular ao dispositivo {deviceToLink?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="playlist">Playlist</Label>
                <Select
                  value={selectedPlaylistId}
                  onValueChange={setSelectedPlaylistId}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Selecione uma playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma (remover vínculo)</SelectItem>
                    {playlists.map(playlist => (
                      <SelectItem key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setLinkPlaylistDialogOpen(false);
              setDeviceToLink(null);
              setSelectedPlaylistId("");
            }}>
              Cancelar
            </Button>
            <Button onClick={handleLinkPlaylist}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Devices;

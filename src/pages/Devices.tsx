
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

const Devices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceCode, setNewDeviceCode] = useState("");
  const [newDeviceDescription, setNewDeviceDescription] = useState("");

  // Fetch devices from Supabase
  useEffect(() => {
    async function fetchDevices() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('devices')
          .select('*, device_playlists(playlists(name))')
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
          playlist: device.device_playlists?.[0]?.playlists?.name || 'Nenhuma'
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
    }

    fetchDevices();
  }, [toast]);

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
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
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
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
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
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
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
    </div>
  );
};

export default Devices;

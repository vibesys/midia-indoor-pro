
import { useState } from "react";
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

const Devices = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");

  // Mock devices data (will be replaced with Supabase data)
  const mockDevices = [
    { id: 1, name: "TV Recepção", code: "REC001", status: "online", lastSeen: "Há 5 minutos", playlist: "Destaques" },
    { id: 2, name: "TV Sala de Espera", code: "ESP002", status: "online", lastSeen: "Há 2 minutos", playlist: "Notícias" },
    { id: 3, name: "TV Corredor", code: "COR003", status: "offline", lastSeen: "Há 2 dias", playlist: "Promocional" },
    { id: 4, name: "TV Cafeteria", code: "CAF004", status: "online", lastSeen: "Há 10 minutos", playlist: "Menu Digital" },
    { id: 5, name: "TV Sala de Reuniões", code: "REU005", status: "offline", lastSeen: "Há 3 dias", playlist: "Corporativo" },
  ];

  const filteredDevices = mockDevices.filter(device => 
    device.name.toLowerCase().includes(search.toLowerCase()) || 
    device.code.toLowerCase().includes(search.toLowerCase())
  );

  const statusIndicator = (status: string) => {
    return (
      <div className="flex items-center gap-2">
        <div className={`status-indicator ${status}`}></div>
        <span>{status === "online" ? "Online" : "Offline"}</span>
      </div>
    );
  };

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
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
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
          <TabsTrigger value="all">Todos ({mockDevices.length})</TabsTrigger>
          <TabsTrigger value="online">Online ({mockDevices.filter(d => d.status === "online").length})</TabsTrigger>
          <TabsTrigger value="offline">Offline ({mockDevices.filter(d => d.status === "offline").length})</TabsTrigger>
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
                {filteredDevices.map((device) => (
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
                ))}
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
                  ))}
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
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Devices;

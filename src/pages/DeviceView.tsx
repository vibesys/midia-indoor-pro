
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Power, RefreshCw, PlaySquare, Monitor } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DeviceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock device data (will be replaced with Supabase data)
  const device = {
    id: Number(id),
    name: `TV Recepção ${id}`,
    code: `REC00${id}`,
    status: "online",
    lastSeen: "Há 5 minutos",
    playlist: "Destaques",
    location: "Recepção Principal",
    ipAddress: "192.168.1.101",
    model: "Android TV Box",
    osVersion: "Android 10",
    appVersion: "1.2.0",
  };

  const mockPlaylist = [
    { id: 1, type: "image", name: "Banner Promocional.jpg", duration: "10s" },
    { id: 2, type: "video", name: "Vídeo Institucional.mp4", duration: "45s" },
    { id: 3, type: "link", name: "Previsão do Tempo", url: "https://climatempo.com.br", duration: "15s" },
    { id: 4, type: "image", name: "Quadro de Avisos.png", duration: "15s" },
    { id: 5, type: "link", name: "Últimas Notícias", url: "https://g1.globo.com", duration: "30s" },
  ];

  const mockActivityLog = [
    { date: "2025-05-15 14:32:00", event: "Dispositivo conectado", details: "IP: 192.168.1.101" },
    { date: "2025-05-15 14:30:45", event: "Playlist carregada", details: "Playlist: Destaques" },
    { date: "2025-05-15 08:15:22", event: "Dispositivo conectado", details: "IP: 192.168.1.101" },
    { date: "2025-05-14 18:45:01", event: "Dispositivo desconectado", details: "Desligamento normal" },
    { date: "2025-05-14 08:02:18", event: "Dispositivo conectado", details: "IP: 192.168.1.101" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/devices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Monitor className="h-6 w-6" />
            {device.name}
          </h2>
          <p className="text-muted-foreground">
            Código: {device.code} • Status: 
            <span className="ml-1 inline-flex items-center">
              <div className={`status-indicator ${device.status} mr-1`}></div>
              {device.status === "online" ? "Online" : "Offline"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="syntax-card function-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlaySquare className="h-5 w-5" />
              Preview do Conteúdo Atual
            </CardTitle>
            <CardDescription>
              Visualização simulada do dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-code border rounded-md aspect-video flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-code-string">Banner Promocional.jpg</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  (Após integração com Supabase, o conteúdo real será exibido aqui)
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button disabled variant="outline" className="w-full">
                Pausar Exibição
              </Button>
              <Button disabled variant="outline" className="w-full">
                Próximo Item
              </Button>
              <Button disabled variant="outline" className="w-full">
                Reiniciar Playlist
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="syntax-card string-card">
          <CardHeader>
            <CardTitle>Informações do Dispositivo</CardTitle>
            <CardDescription>
              Detalhes técnicos e status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Última Conexão</p>
                <p className="text-code-string">{device.lastSeen}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Localização</p>
                <p>{device.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Endereço IP</p>
                <p className="font-mono">{device.ipAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Modelo</p>
                <p>{device.model}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Versão do SO</p>
                <p>{device.osVersion}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Versão do App</p>
                <p>{device.appVersion}</p>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Button disabled className="w-full flex items-center gap-2">
                  <Power className="h-4 w-4" />
                  Reiniciar Dispositivo
                </Button>
                <Button disabled className="w-full flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Atualizar App
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="playlist">
        <TabsList>
          <TabsTrigger value="playlist">Playlist Atual</TabsTrigger>
          <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
        </TabsList>
        <TabsContent value="playlist">
          <Card>
            <CardHeader>
              <CardTitle>Playlist: {device.playlist}</CardTitle>
              <CardDescription>
                Sequência de itens em exibição neste dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockPlaylist.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted w-8 h-8 rounded-md flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.type === "link" ? `URL: ${item.url}` : `Tipo: ${item.type === "image" ? "Imagem" : "Vídeo"}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">{item.duration}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Atividade</CardTitle>
              <CardDescription>
                Histórico recente de atividades neste dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockActivityLog.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{log.event}</p>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                    </div>
                    <div className="text-sm font-mono">{log.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceView;


import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Power, RefreshCw, PlaySquare, Monitor } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const DeviceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    async function fetchDeviceData() {
      try {
        setLoading(true);
        
        // Fetch device data
        const { data: deviceData, error: deviceError } = await supabase
          .from('devices')
          .select('*, device_playlists(playlist_id, playlists(name))')
          .eq('id', id)
          .single();
          
        if (deviceError) {
          throw deviceError;
        }

        if (!deviceData) {
          toast({
            title: "Dispositivo não encontrado",
            description: "O dispositivo solicitado não existe.",
            variant: "destructive",
          });
          navigate("/devices");
          return;
        }
        
        // Format device data
        const formattedDevice = {
          id: deviceData.id,
          name: deviceData.name,
          code: deviceData.code,
          status: deviceData.status || 'offline',
          lastSeen: deviceData.last_seen ? new Date(deviceData.last_seen).toLocaleString() : 'Nunca',
          playlist: deviceData.device_playlists?.[0]?.playlists?.name || 'Nenhuma',
          location: deviceData.description || 'Não especificado',
          ipAddress: '192.168.1.101', // Mock data
          model: 'Android TV Box',    // Mock data
          osVersion: 'Android 10',    // Mock data
          appVersion: '1.2.0',        // Mock data
        };
        
        setDevice(formattedDevice);
        
        // If device has an active playlist, fetch the playlist items
        if (deviceData.device_playlists && deviceData.device_playlists.length > 0) {
          const playlistId = deviceData.device_playlists[0].playlist_id;
          
          // Fetch playlist items
          const { data: playlistItemsData, error: playlistItemsError } = await supabase
            .from('playlist_items')
            .select('*, playlists(name)')
            .eq('playlist_id', playlistId)
            .order('order_num');
            
          if (!playlistItemsError && playlistItemsData) {
            // For each item, we need to fetch its details based on item_type
            const playlistItemsWithDetails = await Promise.all(playlistItemsData.map(async (item) => {
              let itemDetails = {};
              
              if (item.item_type === 'image' || item.item_type === 'video') {
                // Fetch media file details
                const { data: mediaData } = await supabase
                  .from('media_files')
                  .select('*')
                  .eq('id', item.item_id)
                  .single();
                  
                if (mediaData) {
                  itemDetails = {
                    id: item.id,
                    type: item.item_type,
                    name: mediaData.name,
                    duration: item.item_type === 'video' ? mediaData.duration || '30s' : '10s'
                  };
                }
              } else if (item.item_type === 'link') {
                // Fetch link details
                const { data: linkData } = await supabase
                  .from('external_links')
                  .select('*')
                  .eq('id', item.item_id)
                  .single();
                  
                if (linkData) {
                  itemDetails = {
                    id: item.id,
                    type: 'link',
                    name: linkData.title,
                    url: linkData.url,
                    duration: `${linkData.display_time}s`
                  };
                }
              }
              
              return itemDetails;
            }));
            
            // Filter out empty items
            setPlaylist(playlistItemsWithDetails.filter(item => Object.keys(item).length > 0));
          } else {
            // Set empty playlist if there's an error or no data
            setPlaylist([]);
          }
        } else {
          setPlaylist([]);
        }
        
        // Mock activity log (would be replaced with real logs from Supabase)
        setActivityLog([
          { date: "2025-05-15 14:32:00", event: "Dispositivo conectado", details: "IP: 192.168.1.101" },
          { date: "2025-05-15 14:30:45", event: "Playlist carregada", details: `Playlist: ${formattedDevice.playlist}` },
          { date: "2025-05-15 08:15:22", event: "Dispositivo conectado", details: "IP: 192.168.1.101" },
          { date: "2025-05-14 18:45:01", event: "Dispositivo desconectado", details: "Desligamento normal" },
          { date: "2025-05-14 08:02:18", event: "Dispositivo conectado", details: "IP: 192.168.1.101" },
        ]);
      } catch (error) {
        console.error("Error fetching device data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dispositivo.",
          variant: "destructive",
        });
        navigate("/devices");
      } finally {
        setLoading(false);
      }
    }

    fetchDeviceData();
  }, [id, navigate, toast]);

  if (loading || !device) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando dados do dispositivo...</div>
      </div>
    );
  }

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
              <div className={`h-2 w-2 rounded-full ${device.status === "online" ? "bg-green-500" : "bg-red-500"} mr-1`}></div>
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
              {playlist.length > 0 ? (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-code-string">{playlist[0].name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    (Item 1 de {playlist.length})
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-code-string">Nenhum conteúdo</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    (Este dispositivo não possui uma playlist ativa)
                  </p>
                </div>
              )}
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
                {playlist.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum item na playlist atual
                  </div>
                ) : (
                  playlist.map((item, index) => (
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
                  ))
                )}
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
                {activityLog.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum log de atividade disponível
                  </div>
                ) : (
                  activityLog.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{log.event}</p>
                        <p className="text-xs text-muted-foreground">{log.details}</p>
                      </div>
                      <div className="text-sm font-mono">{log.date}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceView;

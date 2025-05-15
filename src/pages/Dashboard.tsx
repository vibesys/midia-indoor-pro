
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, ImageIcon, Link as LinkIcon, PlaySquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    devices: {
      total: 0,
      online: 0,
      offline: 0
    },
    media: {
      total: 0,
      images: 0,
      videos: 0
    },
    links: {
      total: 0
    },
    playlists: {
      total: 0,
      active: 0
    }
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch devices data
        const { data: devicesData, error: devicesError } = await supabase
          .from('devices')
          .select('*');
          
        // Fetch media files data
        const { data: mediaData, error: mediaError } = await supabase
          .from('media_files')
          .select('*');
          
        // Fetch links data
        const { data: linksData, error: linksError } = await supabase
          .from('external_links')
          .select('*');
          
        // Fetch playlists data
        const { data: playlistsData, error: playlistsError } = await supabase
          .from('playlists')
          .select('*');
          
        // Fetch active device playlists
        const { data: devicePlaylistsData, error: devicePlaylistsError } = await supabase
          .from('device_playlists')
          .select('*')
          .eq('is_active', true);

        if (devicesError || mediaError || linksError || playlistsError || devicePlaylistsError) {
          console.error("Error fetching dashboard data:", 
            devicesError || mediaError || linksError || playlistsError || devicePlaylistsError);
          return;
        }

        // Calculate statistics
        const onlineDevices = devicesData?.filter(device => device.status === 'online') || [];
        const offlineDevices = devicesData?.filter(device => device.status === 'offline') || [];
        
        const imageFiles = mediaData?.filter(file => file.type === 'image') || [];
        const videoFiles = mediaData?.filter(file => file.type === 'video') || [];

        // Update dashboard stats
        setDashboardStats({
          devices: {
            total: devicesData?.length || 0,
            online: onlineDevices.length,
            offline: offlineDevices.length
          },
          media: {
            total: mediaData?.length || 0,
            images: imageFiles.length,
            videos: videoFiles.length
          },
          links: {
            total: linksData?.length || 0
          },
          playlists: {
            total: playlistsData?.length || 0,
            active: devicePlaylistsData?.length || 0
          }
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Cards for quick access
  const quickAccessCards = [
    {
      title: "Dispositivos",
      description: "Gerenciar TVs e displays",
      icon: Monitor,
      stats: `${dashboardStats.devices.online} online, ${dashboardStats.devices.offline} offline`,
      path: "/devices",
      cardClass: "string-card"
    },
    {
      title: "Mídia",
      description: "Gerenciar imagens e vídeos",
      icon: ImageIcon,
      stats: `${dashboardStats.media.images} imagens, ${dashboardStats.media.videos} vídeos`,
      path: "/media",
      cardClass: "var-card"
    },
    {
      title: "Links Externos",
      description: "Gerenciar URLs externas",
      icon: LinkIcon,
      stats: `${dashboardStats.links.total} links`,
      path: "/links",
      cardClass: "function-card"
    },
    {
      title: "Playlists",
      description: "Gerenciar sequências de conteúdo",
      icon: PlaySquare,
      stats: `${dashboardStats.playlists.active} ativas de ${dashboardStats.playlists.total}`,
      path: "/playlists",
      cardClass: "keyword-card"
    }
  ];

  // Simplified mock data for active devices (replace with actual data later)
  const activeDevices = [
    { id: 1, name: "TV Recepção 1", status: "online", playlist: "Homepage" },
    { id: 2, name: "TV Recepção 2", status: "online", playlist: "Homepage" },
    { id: 3, name: "TV Recepção 3", status: "online", playlist: "Homepage" },
    { id: 4, name: "TV Sala 4", status: "offline", playlist: null },
    { id: 5, name: "TV Sala 5", status: "offline", playlist: null }
  ];

  // Simplified mock data for playlists (replace with actual data later)
  const activePlaylists = [
    { id: 1, name: "Playlist 1", itemCount: 4 },
    { id: 2, name: "Playlist 2", itemCount: 5 },
    { id: 3, name: "Playlist 3", itemCount: 6 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema de gestão de mídia indoor.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {quickAccessCards.map((card, index) => (
          <Card 
            key={index} 
            className={`syntax-card ${card.cardClass} hover:scale-105 transition-transform cursor-pointer`}
            onClick={() => navigate(card.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-semibold">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <p className="text-2xl font-bold mt-2">{dashboardStats[card.title.toLowerCase() as keyof typeof dashboardStats]?.total || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.stats}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="syntax-card operator-card">
          <CardHeader>
            <CardTitle>Dispositivos Ativos</CardTitle>
            <CardDescription>Status em tempo real dos dispositivos conectados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-semibold">{device.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {device.status === 'online' ? `Playlist: ${device.playlist}` : 'Offline'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <button 
              className="text-sm text-primary hover:underline" 
              onClick={() => navigate('/devices')}
            >
              Ver todos os dispositivos
            </button>
          </CardFooter>
        </Card>

        <Card className="syntax-card string-card">
          <CardHeader>
            <CardTitle>Playlists Ativas</CardTitle>
            <CardDescription>Configurações atuais de exibição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activePlaylists.map((playlist) => (
                <div key={playlist.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <PlaySquare className="h-4 w-4 text-accent" />
                    <span className="font-semibold">{playlist.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{playlist.itemCount} itens</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <button 
              className="text-sm text-primary hover:underline" 
              onClick={() => navigate('/playlists')}
            >
              Gerenciar playlists
            </button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="comment">// Sistema integrado com Supabase para funcionalidade completa</p>
      </div>
    </div>
  );
};

export default Dashboard;

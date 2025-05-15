
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, ImageIcon, Link as LinkIcon, PlaySquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data (will be replaced with Supabase data after integration)
  const stats = {
    devices: {
      total: 12,
      online: 8,
      offline: 4
    },
    media: {
      total: 45,
      images: 32,
      videos: 13
    },
    links: {
      total: 18
    },
    playlists: {
      total: 7,
      active: 5
    }
  };

  // Cards for quick access
  const quickAccessCards = [
    {
      title: "Dispositivos",
      description: "Gerenciar TVs e displays",
      icon: Monitor,
      stats: `${stats.devices.online} online, ${stats.devices.offline} offline`,
      path: "/devices",
      cardClass: "string-card"
    },
    {
      title: "Mídia",
      description: "Gerenciar imagens e vídeos",
      icon: ImageIcon,
      stats: `${stats.media.images} imagens, ${stats.media.videos} vídeos`,
      path: "/media",
      cardClass: "var-card"
    },
    {
      title: "Links Externos",
      description: "Gerenciar URLs externas",
      icon: LinkIcon,
      stats: `${stats.links.total} links`,
      path: "/links",
      cardClass: "function-card"
    },
    {
      title: "Playlists",
      description: "Gerenciar sequências de conteúdo",
      icon: PlaySquare,
      stats: `${stats.playlists.active} ativas de ${stats.playlists.total}`,
      path: "/playlists",
      cardClass: "keyword-card"
    }
  ];

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
              <p className="text-2xl font-bold mt-2">{stats[card.title.toLowerCase() as keyof typeof stats].total}</p>
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="status-indicator online"></div>
                    <span className="font-semibold">TV Recepção {i}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Playlist: Homepage</div>
                </div>
              ))}
              {[4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="status-indicator offline"></div>
                    <span className="font-semibold">TV Sala {i}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Offline</div>
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <PlaySquare className="h-4 w-4 text-accent" />
                    <span className="font-semibold">Playlist {i}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{3 + i} itens</div>
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
        <p className="comment">// Este é um sistema de demonstração, conecte ao Supabase para funcionalidade completa</p>
      </div>
    </div>
  );
};

export default Dashboard;

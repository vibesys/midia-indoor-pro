
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  PlaySquare, 
  Check, 
  Image as ImageIcon,
  Film,
  Link,
  Monitor,
  LayoutList,
  ArrowRight,
  MoveUp,
  MoveDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Playlists = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");

  // Mock playlists data (will be replaced with Supabase data)
  const mockPlaylists = [
    { 
      id: 1, 
      name: "Destaques", 
      description: "Conteúdo promocional principal", 
      itemCount: 7, 
      devices: 4,
      active: true,
      createdAt: "2025-05-10",
      items: [
        { id: 1, type: "image", name: "Banner Promocional.jpg", duration: "10s" },
        { id: 2, type: "video", name: "Vídeo Institucional.mp4", duration: "45s" },
        { id: 3, type: "link", name: "Previsão do Tempo", duration: "15s" },
      ]
    },
    { 
      id: 2, 
      name: "Notícias", 
      description: "Atualizações e informações gerais", 
      itemCount: 5, 
      devices: 2,
      active: true,
      createdAt: "2025-05-08",
      items: [
        { id: 4, type: "link", name: "Últimas Notícias", duration: "30s" },
        { id: 5, type: "image", name: "Quadro de Avisos.png", duration: "15s" },
      ]
    },
    { 
      id: 3, 
      name: "Menu Digital", 
      description: "Cardápio e produtos", 
      itemCount: 12, 
      devices: 2,
      active: true,
      createdAt: "2025-05-05",
      items: [
        { id: 6, type: "image", name: "Menu do Dia.jpg", duration: "20s" },
        { id: 7, type: "video", name: "Apresentação de Pratos.mp4", duration: "30s" },
      ]
    },
    { 
      id: 4, 
      name: "Corporativo", 
      description: "Conteúdo para áreas internas", 
      itemCount: 8, 
      devices: 3,
      active: false,
      createdAt: "2025-05-01",
      items: [
        { id: 8, type: "image", name: "Comunicado Interno.jpg", duration: "15s" },
        { id: 9, type: "link", name: "Calendário de Eventos", duration: "20s" },
      ]
    },
    { 
      id: 5, 
      name: "Promocional", 
      description: "Ofertas e promoções", 
      itemCount: 6, 
      devices: 1,
      active: true,
      createdAt: "2025-04-28",
      items: [
        { id: 10, type: "image", name: "Promoção do Mês.jpg", duration: "15s" },
        { id: 11, type: "video", name: "Campanha Sazonal.mp4", duration: "25s" },
      ]
    },
  ];

  const filteredPlaylists = mockPlaylists.filter(playlist => 
    playlist.name.toLowerCase().includes(search.toLowerCase()) ||
    playlist.description.toLowerCase().includes(search.toLowerCase())
  );

  const [selectedPlaylist, setSelectedPlaylist] = useState<typeof mockPlaylists[0] | null>(null);
  
  const openPlaylistDetail = (playlist: typeof mockPlaylists[0]) => {
    setSelectedPlaylist(playlist);
  };

  // Available media and links to add to playlists
  const availableMedia = [
    { id: 1, name: "Banner Promocional.jpg", type: "image" },
    { id: 2, name: "Vídeo Institucional.mp4", type: "video" },
    { id: 3, name: "Quadro de Avisos.png", type: "image" },
    { id: 4, name: "Promoção do Mês.jpg", type: "image" },
    { id: 5, name: "Tutorial de Produto.mp4", type: "video" },
  ];
  
  const availableLinks = [
    { id: 1, name: "Previsão do Tempo", url: "https://climatempo.com.br" },
    { id: 2, name: "Últimas Notícias", url: "https://g1.globo.com" },
    { id: 3, name: "Cotação do Dólar", url: "https://economia.uol.com.br/cotacoes" },
    { id: 4, name: "Calendário de Eventos", url: "https://example.com/events" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Playlists</h2>
          <p className="text-muted-foreground">
            Crie e gerencie sequências de exibição para os dispositivos.
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Playlist</DialogTitle>
              <DialogDescription>
                Defina os detalhes básicos da playlist.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Playlist</Label>
                <Input id="name" placeholder="Ex: Destaques da Semana" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Breve descrição sobre o conteúdo desta playlist"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Criar e Adicionar Itens
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar playlists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {selectedPlaylist ? (
        <PlaylistDetail 
          playlist={selectedPlaylist} 
          onBack={() => setSelectedPlaylist(null)}
          availableMedia={availableMedia}
          availableLinks={availableLinks}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaylists.map((playlist) => (
            <Card 
              key={playlist.id} 
              className={`syntax-card ${playlist.active ? 'keyword-card' : 'operator-card'} hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => openPlaylistDetail(playlist)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{playlist.name}</CardTitle>
                  <Badge variant={playlist.active ? "outline" : "secondary"}>
                    {playlist.active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <CardDescription>{playlist.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <LayoutList className="h-4 w-4" />
                    <span>{playlist.itemCount} itens</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Monitor className="h-4 w-4" />
                    <span>{playlist.devices} dispositivos</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {playlist.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        {item.type === 'image' && <ImageIcon className="h-3 w-3" />}
                        {item.type === 'video' && <Film className="h-3 w-3" />}
                        {item.type === 'link' && <Link className="h-3 w-3" />}
                        <span className="truncate max-w-[150px]">{item.name}</span>
                      </div>
                      <span>{item.duration}</span>
                    </div>
                  ))}
                  {playlist.items.length < playlist.itemCount && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      + {playlist.itemCount - playlist.items.length} mais itens
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => {
                  e.stopPropagation();
                  // Toggle active state (will be implemented with Supabase)
                }}>
                  {playlist.active ? <Check className="h-4 w-4" /> : <PlaySquare className="h-4 w-4" />}
                  <span>{playlist.active ? "Ativa" : "Ativar"}</span>
                </Button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                    e.stopPropagation();
                    // Edit action
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                    e.stopPropagation();
                    // Delete action
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Playlist Detail Component
interface PlaylistDetailProps {
  playlist: any;
  onBack: () => void;
  availableMedia: any[];
  availableLinks: any[];
}

const PlaylistDetail = ({ playlist, onBack, availableMedia, availableLinks }: PlaylistDetailProps) => {
  const [addItemDialog, setAddItemDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowRight className="h-4 w-4 rotate-180" />
        </Button>
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <PlaySquare className="h-5 w-5" />
            {playlist.name}
            <Badge variant={playlist.active ? "outline" : "secondary"} className="ml-2">
              {playlist.active ? "Ativa" : "Inativa"}
            </Badge>
          </h3>
          <p className="text-muted-foreground">{playlist.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="syntax-card keyword-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Itens da Playlist</span>
                <Dialog open={addItemDialog} onOpenChange={setAddItemDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-1">
                      <PlusCircle className="h-4 w-4" />
                      Adicionar Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Item à Playlist</DialogTitle>
                      <DialogDescription>
                        Selecione o conteúdo para adicionar à playlist.
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="media">
                      <TabsList className="w-full">
                        <TabsTrigger value="media" className="flex-1">Mídia</TabsTrigger>
                        <TabsTrigger value="links" className="flex-1">Links Externos</TabsTrigger>
                      </TabsList>
                      <TabsContent value="media" className="mt-4">
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                          {availableMedia.map((media) => (
                            <div 
                              key={media.id}
                              className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/30 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                {media.type === 'image' ? (
                                  <ImageIcon className="h-4 w-4" />
                                ) : (
                                  <Film className="h-4 w-4" />
                                )}
                                <span>{media.name}</span>
                              </div>
                              <Button size="sm" variant="ghost">Adicionar</Button>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="links" className="mt-4">
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                          {availableLinks.map((link) => (
                            <div 
                              key={link.id}
                              className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/30 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Link className="h-4 w-4" />
                                <div>
                                  <div>{link.name}</div>
                                  <div className="text-xs text-muted-foreground">{link.url}</div>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">Adicionar</Button>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                    <DialogFooter>
                      <Button onClick={() => setAddItemDialog(false)}>Fechar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Arraste para reorganizar a ordem de exibição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {playlist.items.concat(
                  // Add more items to show a longer list
                  { id: 101, type: "image", name: "Promoção do Mês.jpg", duration: "10s" },
                  { id: 102, type: "video", name: "Tutorial de Produto.mp4", duration: "30s" },
                  { id: 103, type: "link", name: "Cotação do Dólar", duration: "20s" },
                  { id: 104, type: "image", name: "Logo Animado.png", duration: "5s" }
                ).map((item, index) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted/30 w-8 h-8 rounded-md flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.type === 'image' && <ImageIcon className="h-4 w-4 text-code-string" />}
                        {item.type === 'video' && <Film className="h-4 w-4 text-code-var" />}
                        {item.type === 'link' && <Link className="h-4 w-4 text-code-function" />}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Duração: {item.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Editar Duração</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="syntax-card string-card">
            <CardHeader>
              <CardTitle>Detalhes da Playlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Nome</p>
                <p>{playlist.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Descrição</p>
                <p className="text-sm">{playlist.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total de Itens</p>
                <p>{playlist.itemCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Criada em</p>
                <p>{playlist.createdAt}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Estado</p>
                <Badge variant={playlist.active ? "outline" : "secondary"}>
                  {playlist.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <div className="pt-2">
                <Button className="w-full">{playlist.active ? "Desativar" : "Ativar"} Playlist</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="syntax-card function-card">
            <CardHeader>
              <CardTitle>Dispositivos</CardTitle>
              <CardDescription>
                Exibindo esta playlist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(playlist.devices)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="status-indicator online"></div>
                      <span className="font-medium">TV Sala {i+1}</span>
                    </div>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Gerenciar Dispositivos</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Playlists;

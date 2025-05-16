import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

interface PlaylistType extends Tables<"playlists"> {
  itemCount?: number;
  devices?: number;
  active?: boolean;
  items?: PlaylistItemType[];
}

interface MediaFileType extends Tables<"media_files"> {}
interface ExternalLinkType extends Tables<"external_links"> {}

interface PlaylistItemType {
  id: string;
  type: "image" | "video" | "link";
  name: string;
  duration: string;
}

interface DevicePlaylistType extends Tables<"device_playlists"> {}

const Playlists = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      
      // Buscar as playlists
      const { data: playlistsData, error: playlistsError } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (playlistsError) throw playlistsError;
      
      if (!playlistsData) {
        setPlaylists([]);
        return;
      }
      
      // Para cada playlist, buscar os itens associados
      const playlistsWithItemsPromises = playlistsData.map(async (playlist) => {
        // Contar itens
        const { count: itemCount, error: itemsError } = await supabase
          .from("playlist_items")
          .select("*", { count: "exact", head: false })
          .eq("playlist_id", playlist.id);
        
        if (itemsError) throw itemsError;
        
        // Contar dispositivos que usam essa playlist
        const { count: deviceCount, error: deviceError } = await supabase
          .from("device_playlists")
          .select("*", { count: "exact", head: false })
          .eq("playlist_id", playlist.id);
          
        if (deviceError) throw deviceError;
        
        // Buscar se algum dispositivo tem essa playlist ativa
        const { data: activeData, error: activeError } = await supabase
          .from("device_playlists")
          .select("is_active")
          .eq("playlist_id", playlist.id)
          .eq("is_active", true)
          .limit(1);
          
        if (activeError) throw activeError;
        
        // Buscar os primeiros itens para visualização
        const { data: playlistItems, error: itemsDetailError } = await supabase
          .from("playlist_items")
          .select("*")
          .eq("playlist_id", playlist.id)
          .order("order_num", { ascending: true })
          .limit(3);
        
        if (itemsDetailError) throw itemsDetailError;
        
        // Para cada item, buscar detalhes adicionais
        const itemsWithDetails = await Promise.all((playlistItems || []).map(async (item) => {
          let name = "";
          let duration = "";
          
          if (item.item_type === "image" || item.item_type === "video") {
            // Buscar detalhes do arquivo de mídia
            const { data: media, error: mediaError } = await supabase
              .from("media_files")
              .select("name, duration, format")
              .eq("id", item.item_id)
              .single();
            
            if (!mediaError && media) {
              name = media.name;
              duration = item.item_type === "video" ? media.duration || "0:30" : "10s";
            }
          } else if (item.item_type === "link") {
            // Buscar detalhes do link externo
            const { data: link, error: linkError } = await supabase
              .from("external_links")
              .select("title, display_time")
              .eq("id", item.item_id)
              .single();
            
            if (!linkError && link) {
              name = link.title;
              duration = `${link.display_time}s`;
            }
          }
          
          return {
            id: item.id,
            type: item.item_type as "image" | "video" | "link",
            name,
            duration
          };
        }));
        
        return {
          ...playlist,
          itemCount: itemCount || 0,
          devices: deviceCount || 0,
          active: activeData && activeData.length > 0,
          items: itemsWithDetails
        };
      });
      
      const playlistsWithItems = await Promise.all(playlistsWithItemsPromises);
      setPlaylists(playlistsWithItems);
    } catch (error) {
      console.error("Erro ao buscar playlists:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as playlists.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da playlist é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("playlists")
        .insert([{
          name: newPlaylistName,
          description: newPlaylistDescription
        }])
        .select();
      
      if (error) throw error;
      
      setOpenDialog(false);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      fetchPlaylists();
      
      toast({
        title: "Sucesso",
        description: "Playlist criada com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao criar playlist:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a playlist.",
        variant: "destructive"
      });
    }
  };

  const toggleActiveState = async (playlist: PlaylistType) => {
    try {
      // Buscar todos os dispositivos associados a essa playlist
      const { data: devicePlaylists, error: deviceError } = await supabase
        .from("device_playlists")
        .select("*")
        .eq("playlist_id", playlist.id);
      
      if (deviceError) throw deviceError;
      
      // Atualizar o estado ativo/inativo para todos os dispositivos
      if (devicePlaylists && devicePlaylists.length > 0) {
        const newState = !playlist.active;
        
        const updatePromises = devicePlaylists.map(async (dp) => {
          const { error } = await supabase
            .from("device_playlists")
            .update({ is_active: newState })
            .eq("id", dp.id);
          
          if (error) throw error;
        });
        
        await Promise.all(updatePromises);
        fetchPlaylists();
        
        toast({
          title: "Sucesso",
          description: `Playlist ${newState ? "ativada" : "desativada"} com sucesso.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Aviso",
          description: "Esta playlist não está associada a nenhum dispositivo.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erro ao alterar estado da playlist:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o estado da playlist.",
        variant: "destructive"
      });
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      // Verificar se há itens associados a esta playlist
      const { count: itemCount, error: countError } = await supabase
        .from("playlist_items")
        .select("*", { count: "exact", head: false })
        .eq("playlist_id", id);
      
      if (countError) throw countError;
      
      if (itemCount && itemCount > 0) {
        // Excluir todos os itens da playlist
        const { error: itemsDeleteError } = await supabase
          .from("playlist_items")
          .delete()
          .eq("playlist_id", id);
        
        if (itemsDeleteError) throw itemsDeleteError;
      }
      
      // Verificar se há dispositivos associados a esta playlist
      const { count: deviceCount, error: deviceCountError } = await supabase
        .from("device_playlists")
        .select("*", { count: "exact", head: false })
        .eq("playlist_id", id);
      
      if (deviceCountError) throw deviceCountError;
      
      if (deviceCount && deviceCount > 0) {
        // Excluir todas as associações com dispositivos
        const { error: devicesDeleteError } = await supabase
          .from("device_playlists")
          .delete()
          .eq("playlist_id", id);
        
        if (devicesDeleteError) throw devicesDeleteError;
      }
      
      // Excluir a playlist
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      fetchPlaylists();
      toast({
        title: "Sucesso",
        description: "Playlist excluída com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao excluir playlist:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a playlist.",
        variant: "destructive"
      });
    }
  };

  const filteredPlaylists = playlists.filter(playlist => 
    playlist.name.toLowerCase().includes(search.toLowerCase()) ||
    (playlist.description && playlist.description.toLowerCase().includes(search.toLowerCase()))
  );

  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistType | null>(null);
  
  const openPlaylistDetail = (playlist: PlaylistType) => {
    setSelectedPlaylist(playlist);
  };

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
                <Input 
                  id="name" 
                  placeholder="Ex: Destaques da Semana" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Breve descrição sobre o conteúdo desta playlist"
                  rows={3}
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={createPlaylist}>
                Criar Playlist
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

      {isLoading ? (
        <div className="flex justify-center p-8">Carregando...</div>
      ) : selectedPlaylist ? (
        <PlaylistDetail 
          playlist={selectedPlaylist} 
          onBack={() => {
            setSelectedPlaylist(null);
            fetchPlaylists();
          }}
        />
      ) : filteredPlaylists.length > 0 ? (
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
                  {playlist.items && playlist.items.map((item) => (
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
                  {playlist.items && playlist.itemCount && playlist.items.length < playlist.itemCount && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      + {playlist.itemCount - playlist.items.length} mais itens
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActiveState(playlist);
                  }}
                >
                  {playlist.active ? <Check className="h-4 w-4" /> : <PlaySquare className="h-4 w-4" />}
                  <span>{playlist.active ? "Ativa" : "Ativar"}</span>
                </Button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                    e.stopPropagation();
                    // Edit action - Redirecionar para os detalhes
                    openPlaylistDetail(playlist);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(playlist.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma playlist encontrada</p>
          <Button 
            className="mt-4"
            onClick={() => setOpenDialog(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Nova Playlist
          </Button>
        </div>
      )}
    </div>
  );
};

// Playlist Detail Component
interface PlaylistDetailProps {
  playlist: PlaylistType;
  onBack: () => void;
}

const PlaylistDetail = ({ playlist, onBack }: PlaylistDetailProps) => {
  const navigate = useNavigate();
  const [addItemDialog, setAddItemDialog] = useState(false);
  const [playlistItems, setPlaylistItems] = useState<{id: string; order_num: number; item_id: string; item_type: string; details: any}[]>([]);
  const [availableMedia, setAvailableMedia] = useState<MediaFileType[]>([]);
  const [availableLinks, setAvailableLinks] = useState<ExternalLinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<{id: string; name: string; status: string}[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaylistDetails();
  }, [playlist.id]);

  const fetchPlaylistDetails = async () => {
    try {
      setIsLoading(true);

      // Buscar todos os itens desta playlist
      const { data: items, error: itemsError } = await supabase
        .from("playlist_items")
        .select("*")
        .eq("playlist_id", playlist.id)
        .order("order_num", { ascending: true });

      if (itemsError) throw itemsError;

      // Para cada item, buscar detalhes adicionais
      const itemsWithDetails = await Promise.all((items || []).map(async (item) => {
        let details = {};
        
        if (item.item_type === "image" || item.item_type === "video") {
          // Buscar detalhes do arquivo de mídia
          const { data: media, error: mediaError } = await supabase
            .from("media_files")
            .select("*")
            .eq("id", item.item_id)
            .single();
          
          if (!mediaError && media) {
            details = media;
          }
        } else if (item.item_type === "link") {
          // Buscar detalhes do link externo
          const { data: link, error: linkError } = await supabase
            .from("external_links")
            .select("*")
            .eq("id", item.item_id)
            .single();
          
          if (!linkError && link) {
            details = link;
          }
        }
        
        return {...item, details};
      }));

      setPlaylistItems(itemsWithDetails);

      // Buscar mídia disponível para adicionar
      const { data: media, error: mediaError } = await supabase
        .from("media_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (mediaError) throw mediaError;
      setAvailableMedia(media || []);

      // Buscar links disponíveis para adicionar
      const { data: links, error: linksError } = await supabase
        .from("external_links")
        .select("*")
        .order("created_at", { ascending: false });

      if (linksError) throw linksError;
      setAvailableLinks(links || []);

      // Buscar dispositivos que utilizam esta playlist
      const { data: devicePlaylists, error: devicePlaylistsError } = await supabase
        .from("device_playlists")
        .select("device_id, is_active")
        .eq("playlist_id", playlist.id);

      if (devicePlaylistsError) throw devicePlaylistsError;

      if (devicePlaylists && devicePlaylists.length > 0) {
        const deviceIds = devicePlaylists.map(dp => dp.device_id);
        
        const { data: devicesData, error: devicesError } = await supabase
          .from("devices")
          .select("id, name, status")
          .in("id", deviceIds);

        if (devicesError) throw devicesError;
        setDevices(devicesData || []);
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da playlist:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da playlist.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItemToPlaylist = async (itemId: string, itemType: string) => {
    try {
      // Determine the next order number
      let nextOrderNum = 1;
      if (playlistItems.length > 0) {
        nextOrderNum = Math.max(...playlistItems.map(item => item.order_num)) + 1;
      }
      
      console.log("Adding item to playlist:", {
        playlist_id: playlist.id,
        item_id: itemId,
        item_type: itemType,
        order_num: nextOrderNum
      });
      
      const { data, error } = await supabase
        .from("playlist_items")
        .insert([{
          playlist_id: playlist.id,
          item_id: itemId,
          item_type: itemType,
          order_num: nextOrderNum
        }])
        .select();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Item added successfully:", data);
      fetchPlaylistDetails();
      setAddItemDialog(false);
      
      toast({
        title: "Sucesso",
        description: "Item adicionado à playlist com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao adicionar item à playlist:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item à playlist.",
        variant: "destructive"
      });
    }
  };

  const removeItemFromPlaylist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("playlist_items")
        .delete()
        .eq("id", itemId);
      
      if (error) throw error;
      
      fetchPlaylistDetails();
      
      toast({
        title: "Sucesso",
        description: "Item removido da playlist com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao remover item da playlist:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item da playlist.",
        variant: "destructive"
      });
    }
  };

  const moveItem = async (itemId: string, direction: "up" | "down") => {
    try {
      const currentIndex = playlistItems.findIndex(item => item.id === itemId);
      if (currentIndex === -1) return;
      
      const currentItem = playlistItems[currentIndex];
      
      let swapIndex;
      if (direction === "up" && currentIndex > 0) {
        swapIndex = currentIndex - 1;
      } else if (direction === "down" && currentIndex < playlistItems.length - 1) {
        swapIndex = currentIndex + 1;
      } else {
        return; // Não é possível mover mais para cima/baixo
      }
      
      const swapItem = playlistItems[swapIndex];
      
      // Trocar os números de ordem
      const tempOrderNum = currentItem.order_num;
      
      // Atualizar o primeiro item
      const { error: error1 } = await supabase
        .from("playlist_items")
        .update({ order_num: swapItem.order_num })
        .eq("id", currentItem.id);
      
      if (error1) throw error1;
      
      // Atualizar o segundo item
      const { error: error2 } = await supabase
        .from("playlist_items")
        .update({ order_num: tempOrderNum })
        .eq("id", swapItem.id);
      
      if (error2) throw error2;
      
      fetchPlaylistDetails();
    } catch (error) {
      console.error("Erro ao mover item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o item.",
        variant: "destructive"
      });
    }
  };

  const togglePlaylistActive = async () => {
    try {
      // Buscar todos os dispositivos associados a essa playlist
      const { data: devicePlaylists, error: deviceError } = await supabase
        .from("device_playlists")
        .select("*")
        .eq("playlist_id", playlist.id);
      
      if (deviceError) throw deviceError;
      
      // Atualizar o estado ativo/inativo para todos os dispositivos
      if (devicePlaylists && devicePlaylists.length > 0) {
        const newState = !playlist.active;
        
        const updatePromises = devicePlaylists.map(async (dp) => {
          const { error } = await supabase
            .from("device_playlists")
            .update({ is_active: newState })
            .eq("id", dp.id);
          
          if (error) throw error;
        });
        
        await Promise.all(updatePromises);
        
        // Atualizar o estado local da playlist
        playlist.active = newState;
        
        toast({
          title: "Sucesso",
          description: `Playlist ${newState ? "ativada" : "desativada"} com sucesso.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Aviso",
          description: "Esta playlist não está associada a nenhum dispositivo.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erro ao alterar estado da playlist:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o estado da playlist.",
        variant: "destructive"
      });
    }
  };

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

      {isLoading ? (
        <div className="flex justify-center p-8">Carregando...</div>
      ) : (
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
                            {availableMedia.length > 0 ? (
                              availableMedia.map((media) => (
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
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => addItemToPlaylist(media.id, media.type)}
                                  >
                                    Adicionar
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                Nenhum arquivo de mídia disponível
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent value="links" className="mt-4">
                          <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {availableLinks.length > 0 ? (
                              availableLinks.map((link) => (
                                <div 
                                  key={link.id}
                                  className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/30 cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <Link className="h-4 w-4" />
                                    <div>
                                      <div>{link.title}</div>
                                      <div className="text-xs text-muted-foreground">{link.url}</div>
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => addItemToPlaylist(link.id, "link")}
                                  >
                                    Adicionar
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                Nenhum link externo disponível
                              </div>
                            )}
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
                  {playlistItems.length > 0 ? (
                    playlistItems.map((item, index) => {
                      const details = item.details;
                      const itemName = details.name || details.title || "Item sem nome";
                      let itemDuration = "";
                      
                      if (item.item_type === "image") {
                        itemDuration = "10s"; // Tempo padrão para imagens
                      } else if (item.item_type === "video") {
                        itemDuration = details.duration || "30s";
                      } else if (item.item_type === "link") {
                        itemDuration = `${details.display_time || 15}s`;
                      }
                      
                      return (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-muted/30 w-8 h-8 rounded-md flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                            <div className="flex items-center gap-2">
                              {item.item_type === 'image' && <ImageIcon className="h-4 w-4 text-code-string" />}
                              {item.item_type === 'video' && <Film className="h-4 w-4 text-code-var" />}
                              {item.item_type === 'link' && <Link className="h-4 w-4 text-code-function" />}
                              <div>
                                <p className="font-medium">{itemName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Duração: {itemDuration}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => moveItem(item.id, "up")}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => moveItem(item.id, "down")}
                              disabled={index === playlistItems.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => removeItemFromPlaylist(item.id)}
                                >
                                  Remover
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum item adicionado a esta playlist
                    </div>
                  )}
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
                  <p>{playlistItems.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Criada em</p>
                  <p>{new Date(playlist.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Estado</p>
                  <Badge variant={playlist.active ? "outline" : "secondary"}>
                    {playlist.active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <div className="pt-2">
                  <Button 
                    className="w-full"
                    onClick={togglePlaylistActive}
                  >{playlist.active ? "Desativar" : "Ativar"} Playlist</Button>
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
                  {devices.length > 0 ? (
                    devices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <div className={`status-indicator ${device.status === 'online' ? 'online' : 'offline'}`}></div>
                          <span className="font-medium">{device.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/devices/${device.id}`)}
                        >Ver</Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum dispositivo está exibindo esta playlist
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/devices')}
                >Gerenciar Dispositivos</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;

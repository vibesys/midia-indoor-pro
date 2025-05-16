
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Image, Film, Edit, Trash2, Play, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

interface MediaFile extends Tables<"media_files"> {}

const MediaFiles = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fileName, setFileName] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("media_files")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setMediaFiles(data || []);
    } catch (error) {
      console.error("Erro ao buscar arquivos de mídia:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os arquivos de mídia.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload || !fileName) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo e forneça um nome.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Determinando o tipo de arquivo
      const isImage = fileToUpload.type.startsWith('image/');
      const isVideo = fileToUpload.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Erro",
          description: "Apenas imagens (JPG, PNG) e vídeos (MP4) são permitidos.",
          variant: "destructive"
        });
        return;
      }

      const fileType = isImage ? 'image' : 'video';
      const fileFormat = fileToUpload.name.split('.').pop()?.toLowerCase() || '';
      const fileSize = `${(fileToUpload.size / (1024 * 1024)).toFixed(1)} MB`;
      
      // Vamos simular um upload (em um caso real, aqui você faria upload para o Storage do Supabase)
      // Para fins de demonstração, estamos apenas inserindo a referência na tabela
      
      // Simulando uma URL (em produção, usaríamos a URL retornada pelo Storage)
      const mockUrl = `https://storage.example.com/${Date.now()}_${fileToUpload.name}`;
      
      // Dados adicionais para imagens e vídeos
      let additionalData = {};
      if (isImage) {
        additionalData = { dimensions: "1920x1080" }; // Simulado
      } else if (isVideo) {
        additionalData = { duration: "0:30" }; // Simulado
      }
      
      const { data, error } = await supabase
        .from("media_files")
        .insert([{
          name: fileName,
          type: fileType,
          format: fileFormat,
          size: fileSize,
          url: mockUrl,
          ...additionalData
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      setOpenDialog(false);
      setFileName("");
      setFileToUpload(null);
      fetchMediaFiles();
      
      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("media_files")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      fetchMediaFiles();
      toast({
        title: "Sucesso",
        description: "Arquivo excluído com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o arquivo.",
        variant: "destructive"
      });
    }
  };

  const filteredMedia = mediaFiles.filter(media => 
    media.name.toLowerCase().includes(search.toLowerCase())
  );

  const images = filteredMedia.filter(media => media.type === "image");
  const videos = filteredMedia.filter(media => media.type === "video");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mídia</h2>
          <p className="text-muted-foreground">
            Gerenciamento de imagens e vídeos para exibição.
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Upload de Mídia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload de Mídia</DialogTitle>
              <DialogDescription>
                Carregue imagens ou vídeos para exibição nos dispositivos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  placeholder="Nome descritivo do arquivo" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Arquivo</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground mb-2">Arraste um arquivo ou</p>
                  <Input 
                    id="file" 
                    type="file" 
                    className="w-full max-w-xs"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou MP4 (max. 50MB)</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleUpload}>
                Fazer Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar mídia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos ({mediaFiles.length})</TabsTrigger>
          <TabsTrigger value="images">Imagens ({images.length})</TabsTrigger>
          <TabsTrigger value="videos">Vídeos ({videos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? (
            <div className="flex justify-center p-8">Carregando...</div>
          ) : filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedia.map((media) => (
                <MediaCard key={media.id} media={media} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum arquivo de mídia encontrado
            </div>
          )}
        </TabsContent>
        <TabsContent value="images">
          {isLoading ? (
            <div className="flex justify-center p-8">Carregando...</div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((media) => (
                <MediaCard key={media.id} media={media} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma imagem encontrada
            </div>
          )}
        </TabsContent>
        <TabsContent value="videos">
          {isLoading ? (
            <div className="flex justify-center p-8">Carregando...</div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((media) => (
                <MediaCard key={media.id} media={media} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum vídeo encontrado
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Media Card Component
const MediaCard = ({ media, onDelete }: { media: MediaFile, onDelete: (id: string) => void }) => {
  return (
    <Card className={`syntax-card ${media.type === 'image' ? 'string-card' : 'var-card'} overflow-hidden`}>
      <div className="aspect-video bg-code relative flex items-center justify-center">
        {media.type === 'image' ? (
          <Image className="h-12 w-12 text-code-string" />
        ) : (
          <Film className="h-12 w-12 text-code-var" />
        )}
        <div className="absolute bottom-0 right-0 p-2 flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
            <Eye className="h-4 w-4" />
          </Button>
          {media.type === 'video' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold truncate">{media.name}</h3>
            <p className="text-xs text-muted-foreground">
              {media.type === 'image' 
                ? `${media.format.toUpperCase()} • ${media.dimensions} • ${media.size}`
                : `${media.format.toUpperCase()} • ${media.duration} • ${media.size}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Adicionado em {new Date(media.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onDelete(media.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaFiles;

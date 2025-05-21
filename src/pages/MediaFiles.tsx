
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Image, Film, Edit, Trash2, Play, Eye, Link, AlertCircle, HardDriveUpload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface MediaFile extends Tables<"media_files"> {}

const MediaFiles = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("image");
  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadOption, setUploadOption] = useState<"link" | "file">("link");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const extractGoogleDriveId = (url: string): string | null => {
    // Vários formatos possíveis de URL do Google Drive
    const patterns = [
      // Formato padrão do arquivo
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      // Formato com ?id=
      /[?&]id=([a-zA-Z0-9_-]+)/,
      // Formato de link compartilhável
      /\/open\?id=([a-zA-Z0-9_-]+)/,
      // Formato de visualização
      /\/view\?usp=sharing.*&id=([a-zA-Z0-9_-]+)/,
      // Formato direto (apenas o ID)
      /^([a-zA-Z0-9_-]{25,})$/
    ];
    
    // Tenta cada padrão até encontrar um que funcione
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log("ID do Google Drive extraído:", match[1]);
        return match[1];
      }
    }
    
    // Verifica se é uma URL de pasta (que não pode ser usada diretamente)
    if (url.match(/\/folders\/([a-zA-Z0-9_-]+)/)) {
      console.error("URL de pasta do Google Drive detectada - não pode ser usada diretamente");
      return null;
    }
    
    console.error("Não foi possível extrair o ID do Google Drive:", url);
    return null;
  };

  const getFileFormatFromUrl = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension) {
      return extension;
    }
    return fileType === "image" ? "jpg" : "mp4"; // Default extensions
  };

  const getFileFormatFromFile = (file: File): string => {
    return file.name.split('.').pop()?.toLowerCase() || (fileType === "image" ? "jpg" : "mp4");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Auto-detect file type
      if (file.type.startsWith('image/')) {
        setFileType('image');
      } else if (file.type.startsWith('video/')) {
        setFileType('video');
      }
      
      // Use file name as default media name if not set
      if (!fileName) {
        setFileName(file.name.split('.')[0]);
      }
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo para upload.",
        variant: "destructive"
      });
      return;
    }

    if (!fileName) {
      setFileName(selectedFile.name.split('.')[0]);
    }

    try {
      const fileFormat = getFileFormatFromFile(selectedFile);
      const fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
      
      // Create a temporary URL for the file
      const objectUrl = URL.createObjectURL(selectedFile);
      
      // Additional data for images and videos
      let additionalData = {};
      if (fileType === "image") {
        additionalData = { dimensions: "Carregando dimensões..." };
      } else if (fileType === "video") {
        additionalData = { duration: "Carregando duração..." };
      }
      
      // Add the file to the database first
      const { data, error } = await supabase
        .from("media_files")
        .insert([{
          name: fileName,
          type: fileType,
          format: fileFormat,
          size: fileSize,
          url: objectUrl, // Temporary URL
          ...additionalData
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      const newMedia = data[0];
      
      // Create a unique path for the file
      const filePath = `${newMedia.id}.${fileFormat}`;
      
      // Upload the file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, selectedFile);
      
      if (uploadError) {
        // If upload fails, delete the database entry
        await supabase.from("media_files").delete().eq("id", newMedia.id);
        throw uploadError;
      }
      
      // Get public URL for the uploaded file
      const { data: fileUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      // Update the media entry with the correct URL
      await supabase
        .from("media_files")
        .update({ url: fileUrlData.publicUrl })
        .eq("id", newMedia.id);
      
      setOpenDialog(false);
      setFileName("");
      setSelectedFile(null);
      fetchMediaFiles();
      
      toast({
        title: "Sucesso",
        description: "Arquivo de mídia enviado com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleAddMedia = async () => {
    if (uploadOption === "file") {
      await handleUploadFile();
      return;
    }

    if (!fileName || !fileUrl) {
      toast({
        title: "Erro",
        description: "Por favor, forneça um nome e um link do Google Drive.",
        variant: "destructive"
      });
      return;
    }

    if (!fileUrl.includes("drive.google.com") && !fileUrl.match(/^[a-zA-Z0-9_-]{25,}$/)) {
      toast({
        title: "Erro",
        description: "Por favor, forneça um link válido do Google Drive.",
        variant: "destructive"
      });
      return;
    }

    try {
      const fileId = extractGoogleDriveId(fileUrl);
      if (!fileId) {
        setErrorMessage("Não foi possível extrair o ID do arquivo do Google Drive. Por favor, verifique se você está compartilhando o arquivo (não uma pasta) e tente novamente.");
        setErrorDialog(true);
        return;
      }

      // Generate direct access URL
      const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      const fileFormat = getFileFormatFromUrl(fileUrl);
      const fileSize = "Tamanho desconhecido"; // Size can't be determined from link

      // Dados adicionais para imagens e vídeos
      let additionalData = {};
      if (fileType === "image") {
        additionalData = { dimensions: "Dimensões desconhecidas" }; 
      } else if (fileType === "video") {
        additionalData = { duration: "Duração desconhecida" }; 
      }
      
      const { data, error } = await supabase
        .from("media_files")
        .insert([{
          name: fileName,
          type: fileType,
          format: fileFormat,
          size: fileSize,
          url: directUrl,
          ...additionalData
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      setOpenDialog(false);
      setFileName("");
      setFileUrl("");
      fetchMediaFiles();
      
      toast({
        title: "Sucesso",
        description: "Link de mídia adicionado com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao adicionar link de mídia:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o link de mídia.",
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
              Adicionar Mídia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Mídia</DialogTitle>
              <DialogDescription>
                Faça upload de arquivos ou adicione links do Google Drive.
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
                <Label>Método de Upload</Label>
                <div className="flex space-x-2">
                  <Button 
                    variant={uploadOption === "file" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setUploadOption("file")}
                    type="button"
                  >
                    <HardDriveUpload className="h-4 w-4 mr-2" /> Upload de Arquivo
                  </Button>
                  <Button 
                    variant={uploadOption === "link" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setUploadOption("link")}
                    type="button"
                  >
                    <Link className="h-4 w-4 mr-2" /> Link do Google Drive
                  </Button>
                </div>
              </div>
              
              {uploadOption === "file" ? (
                <div className="grid gap-2">
                  <Label htmlFor="file">Arquivo</Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="url">Link do Google Drive</Label>
                  <Input 
                    id="url" 
                    placeholder="https://drive.google.com/file/d/..." 
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Compartilhe o arquivo no Google Drive e cole o link aqui. Certifique-se de que o arquivo (não uma pasta) esteja compartilhado.
                  </p>
                </div>
              )}
              
              {uploadOption === "link" && (
                <div className="grid gap-2">
                  <Label>Tipo de Arquivo</Label>
                  <RadioGroup defaultValue="image" value={fileType} onValueChange={setFileType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="image" />
                      <Label htmlFor="image" className="flex items-center gap-1">
                        <Image className="h-4 w-4" /> Imagem
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="video" id="video" />
                      <Label htmlFor="video" className="flex items-center gap-1">
                        <Film className="h-4 w-4" /> Vídeo
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddMedia}>
                Adicionar
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

      {/* Diálogo de erro */}
      <AlertDialog open={errorDialog} onOpenChange={setErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Erro
            </AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog(false)}>
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Media Card Component
const MediaCard = ({ media, onDelete }: { media: MediaFile, onDelete: (id: string) => void }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  
  return (
    <>
      <Card className={`syntax-card ${media.type === 'image' ? 'string-card' : 'var-card'} overflow-hidden`}>
        <div className="aspect-video bg-code relative flex items-center justify-center">
          {media.type === 'image' ? (
            <Image className="h-12 w-12 text-code-string" />
          ) : (
            <Film className="h-12 w-12 text-code-var" />
          )}
          <div className="absolute bottom-0 right-0 p-2 flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={() => setPreviewOpen(true)}
            >
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
            <div className="max-w-[70%]">
              <h3 className="font-semibold truncate">{media.name}</h3>
              <p className="text-xs text-muted-foreground">
                {media.type === 'image' 
                  ? `${media.format.toUpperCase()} • ${media.dimensions || 'Dimensões desconhecidas'}`
                  : `${media.format.toUpperCase()} • ${media.duration || 'Duração desconhecida'}`}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Link className="h-3 w-3" />
                <span className="truncate">
                  {media.url?.includes('drive.google.com') ? 'Google Drive' : 'Upload Local'}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{media.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {media.type === 'image' ? (
              <img 
                src={media.url} 
                alt={media.name} 
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                  (e.target as HTMLImageElement).className += ' border border-muted p-4';
                }}
              />
            ) : (
              <video 
                src={media.url} 
                controls
                className="max-w-full max-h-[70vh]"
                onError={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.outerHTML = '<div class="flex flex-col items-center justify-center border border-muted p-8 text-muted-foreground"><Film class="h-16 w-16 mb-2" /><p>Erro ao carregar o vídeo</p></div>';
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Fechar</Button>
            <Button 
              onClick={() => {
                window.open(media.url, '_blank');
              }}
            >
              Ver Original
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaFiles;

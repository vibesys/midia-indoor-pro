
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import MediaFiles from "./pages/MediaFiles";
import ExternalLinks from "./pages/ExternalLinks";
import Playlists from "./pages/Playlists";
import DeviceView from "./pages/DeviceView";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  // Initialize storage buckets when the app starts
  useEffect(() => {
    const initStorageBuckets = async () => {
      try {
        // Check if the media bucket exists, and create it if not
        const { data: buckets } = await supabase.storage.listBuckets();
        const mediaBucket = buckets?.find(bucket => bucket.name === 'media');
        
        if (!mediaBucket) {
          console.log("Creating media storage bucket...");
          // Bucket doesn't exist, create it
          const { error } = await supabase.storage.createBucket('media', {
            public: true,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['image/*', 'video/*']
          });
          
          if (error) {
            console.error("Error creating media bucket:", error);
          } else {
            console.log("Media storage bucket created successfully");
          }
        }
      } catch (error) {
        console.error("Error checking/creating storage buckets:", error);
      }
    };
    
    initStorageBuckets();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="devices" element={<Devices />} />
                  <Route path="devices/:id" element={<DeviceView />} />
                  <Route path="media" element={<MediaFiles />} />
                  <Route path="links" element={<ExternalLinks />} />
                  <Route path="playlists" element={<Playlists />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

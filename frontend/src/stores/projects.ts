import { create } from 'zustand';
import { useWebSocketStore } from './websocket';

export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'desktop';
  status: 'planning' | 'coding' | 'reviewing' | 'testing' | 'deploying' | 'completed';
  code: string;
  files: ProjectFile[];
  settings: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isModified: boolean;
}

export interface LivePreview {
  html: string;
  css: string;
  js: string;
  error?: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  files: ProjectFile[];
  activeFile: ProjectFile | null;
  livePreview: LivePreview | null;
  isLoading: boolean;
  error: string | null;

  // Project actions
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;

  // File actions
  addFile: (file: Omit<ProjectFile, 'id'>) => void;
  updateFile: (id: string, content: string) => void;
  deleteFile: (id: string) => void;
  setActiveFile: (file: ProjectFile | null) => void;
  getFileByPath: (path: string) => ProjectFile | undefined;

  // Code actions
  updateCode: (content: string, language?: string) => void;
  compileCode: () => Promise<void>;
  updateLivePreview: (preview: Partial<LivePreview>) => void;

  // Real-time actions
  broadcastCodeUpdate: (filePath: string, content: string, language: string) => void;
  broadcastPreviewUpdate: (html: string, css: string, js: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  files: [],
  activeFile: null,
  livePreview: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock data for now - would fetch from API
      const projects: Project[] = [
        {
          id: '1',
          name: 'AI Coding App',
          description: 'Main project for the AI coding application',
          type: 'fullstack',
          status: 'coding',
          code: '// Welcome to AI Coding App',
          files: [
            {
              id: '1',
              name: 'App.tsx',
              path: 'src/App.tsx',
              language: 'typescript',
              content: 'export default App;',
              isModified: false,
            },
          ],
          settings: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      set({ projects, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },

  createProject: async (project) => {
    const newProject: Project = {
      ...project,
      id: `project_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set(state => ({
      projects: [...state.projects, newProject],
    }));

    return newProject.id;
  },

  updateProject: async (id, updates) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === id 
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      ),
    }));

    // Update current project if it's the one being updated
    if (get().currentProject?.id === id) {
      get().setCurrentProject({ ...get().currentProject, ...updates });
    }
  },

  deleteProject: async (id) => {
    set(state => ({
      projects: state.projects.filter(project => project.id !== id),
    }));

    // Clear current project if it's the one being deleted
    if (get().currentProject?.id === id) {
      get().setCurrentProject(null);
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
    
    if (project) {
      // Join project room via WebSocket
      useWebSocketStore.getState().emit('join_project', { projectId: project.id });
      
      // Set project files
      set({ files: project.files });
      
      // Set first file as active if available
      if (project.files.length > 0) {
        get().setActiveFile(project.files[0]);
      }
    } else {
      set({ files: [], activeFile: null });
    }
  },

  addFile: (file) => {
    const newFile: ProjectFile = {
      ...file,
      id: `file_${Date.now()}`,
      isModified: false,
    };

    set(state => ({
      files: [...state.files, newFile],
    }));

    // Update current project files
    if (get().currentProject) {
      get().updateProject(get().currentProject!.id, { 
        files: [...get().files, newFile] 
      });
    }
  },

  updateFile: (id, content) => {
    set(state => ({
      files: state.files.map(file =>
        file.id === id 
          ? { ...file, content, isModified: true }
          : file
      ),
    }));

    // Update active file if it's the one being updated
    if (get().activeFile?.id === id) {
      get().setActiveFile({ ...get().activeFile!, content, isModified: true });
    }

    // Update current project
    if (get().currentProject) {
      get().updateProject(get().currentProject!.id, { 
        files: get().files.map(file => 
          file.id === id 
            ? { ...file, content, isModified: true }
            : file
        ) 
      });
    }
  },

  deleteFile: (id) => {
    set(state => ({
      files: state.files.filter(file => file.id !== id),
    }));

    // Clear active file if it's the one being deleted
    if (get().activeFile?.id === id) {
      get().setActiveFile(get().files.find(f => f.id !== id) || null);
    }

    // Update current project
    if (get().currentProject) {
      get().updateProject(get().currentProject!.id, { 
        files: get().files.filter(f => f.id !== id) 
      });
    }
  },

  setActiveFile: (file) => {
    set({ activeFile: file });
  },

  getFileByPath: (path) => {
    return get().files.find(file => file.path === path);
  },

  updateCode: (content, language = 'typescript') => {
    if (get().activeFile) {
      get().updateFile(get().activeFile!.id, content);
    }
    
    // Broadcast code update to other clients
    if (get().currentProject && get().activeFile) {
      get().broadcastCodeUpdate(get().activeFile.path, content, language);
    }
  },

  compileCode: async () => {
    try {
      // This would typically compile the code and return errors/warnings
      const activeFile = get().activeFile;
      if (!activeFile) return;

      // Simulate compilation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, just update the preview with the current content
      if (activeFile.language === 'typescript' || activeFile.language === 'javascript') {
        const preview: LivePreview = {
          html: `<div id="root"><pre><code>${activeFile.content}</code></pre></div>`,
          css: 'body { font-family: monospace; }',
          js: activeFile.content,
        };

        get().updateLivePreview(preview);
        
        // Broadcast preview update
        if (get().currentProject) {
          get().broadcastPreviewUpdate(preview.html, preview.css, preview.js);
        }
      }
    } catch (error) {
      console.error('Compilation failed:', error);
      
      const errorPreview: LivePreview = {
        html: '<div class="error">Compilation failed</div>',
        css: '.error { color: red; }',
        js: '',
        error: error instanceof Error ? error.message : 'Unknown compilation error',
      };

      get().updateLivePreview(errorPreview);
    }
  },

  updateLivePreview: (preview) => {
    set(state => ({
      livePreview: state.livePreview 
        ? { ...state.livePreview, ...preview }
        : { html: '', css: '', js: '', ...preview }
    }));
  },

  broadcastCodeUpdate: (filePath, content, language) => {
    if (get().currentProject) {
      useWebSocketStore.getState().emit('code_update', {
        projectId: get().currentProject!.id,
        filePath,
        content,
        language,
      });
    }
  },

  broadcastPreviewUpdate: (html, css, js) => {
    if (get().currentProject) {
      useWebSocketStore.getState().emit('live_preview_update', {
        projectId: get().currentProject!.id,
        html,
        css,
        js,
      });
    }
  },
}));

// Listen for WebSocket events
useWebSocketStore.getState().on('code_updated', (data) => {
  const store = useProjectStore.getState();
  const file = store.getFileByPath(data.filePath);
  if (file && file.id !== useWebSocketStore.getState().socket?.id) {
    store.updateFile(file.id, data.content);
  }
});

useWebSocketStore.getState().on('preview_updated', (data) => {
  useProjectStore.getState().updateLivePreview({
    html: data.html,
    css: data.css,
    js: data.js,
  });
});
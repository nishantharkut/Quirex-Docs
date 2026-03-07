import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Edit3, Save, X, Plus, AlertCircle, CheckCircle } from 'lucide-react';

const AdminPanel = ({ onPostUpdate, onBackToList }) => {
  const [files, setFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadFileList = async () => {
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const fileList = await response.json();
        setFiles(fileList);
      }
    } catch (error) {
      console.error('Error loading file list:', error);
    }
  };

  React.useEffect(() => {
    loadFileList();
  }, []);

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    if (uploadedFiles.length === 0) return;

    setIsLoading(true);
    setUploadStatus('');

    try {
      for (const file of uploadedFiles) {
        if (!file.name.endsWith('.md')) {
          setUploadStatus(`Error: ${file.name} is not a markdown file`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setUploadStatus(prev => prev + `✓ ${file.name} uploaded successfully\n`);
        } else {
          setUploadStatus(prev => prev + `✗ Failed to upload ${file.name}\n`);
        }
      }

      await loadFileList();
      onPostUpdate();
      event.target.value = '';
    } catch (error) {
      setUploadStatus(`Error uploading files: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFile = async (filename) => {
    try {
      const response = await fetch(`/md-files/${filename}`);
      if (response.ok) {
        const content = await response.text();
        setEditingFile(filename);
        setEditContent(content);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setUploadStatus(`Error loading ${filename}: ${error.message}`);
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: editingFile,
          content: editContent,
        }),
      });

      if (response.ok) {
        setUploadStatus(`✓ ${editingFile} saved successfully`);
        setEditingFile(null);
        setEditContent('');
        onPostUpdate();
      } else {
        setUploadStatus(`✗ Failed to save ${editingFile}`);
      }
    } catch (error) {
      setUploadStatus(`Error saving file: ${error.message}`);
    }
  };

  const handleDeleteFile = async (filename) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (response.ok) {
        setUploadStatus(`✓ ${filename} deleted successfully`);
        await loadFileList();
        onPostUpdate();
      } else {
        setUploadStatus(`✗ Failed to delete ${filename}`);
      }
    } catch (error) {
      setUploadStatus(`Error deleting file: ${error.message}`);
    }
  };

  const handleCreateNewFile = () => {
    const filename = prompt('Enter filename (e.g., new-post.md):');
    if (filename && filename.endsWith('.md')) {
      setEditingFile(filename);
      setEditContent(`# ${filename.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

---
date: ${new Date().toISOString().split('T')[0]}
author: Your Name
category: general
tags: tag1, tag2
---

Write your content here...
`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your markdown files</p>
        </div>
        <button
          onClick={onBackToList}
          className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
        >
          Back to Blog
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Upload Files
        </h2>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".md"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop markdown files here</p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Uploading...' : 'Select Files'}
            </button>
          </div>

          <button
            onClick={handleCreateNewFile}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New File</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus && (
        <div className="bg-muted border rounded-lg p-4">
          <pre className="text-sm whitespace-pre-wrap">{uploadStatus}</pre>
        </div>
      )}

      {/* File List */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          File Manager
        </h2>
        
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No markdown files found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({new Date(file.modified).toLocaleDateString()})
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditFile(file.name)}
                    className="p-2 hover:bg-background rounded transition-colors"
                    title="Edit file"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.name)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit: {editingFile}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveFile}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setEditingFile(null);
                    setEditContent('');
                  }}
                  className="p-2 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
                placeholder="Write your markdown here..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

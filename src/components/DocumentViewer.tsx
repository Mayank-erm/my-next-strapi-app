// DocumentViewer.tsx - ENHANCED with Office Document Preview Support
import React, { useRef, useEffect, useState } from 'react';
import { 
  DocumentTextIcon as SolidDocumentTextIcon, 
  ArrowDownTrayIcon, 
  EyeIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/20/solid';

interface DocumentAttachment {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface DocumentViewerProps {
  documentPath: string;
  proposalName: string;
  attachment?: DocumentAttachment;
}

// Enhanced file type detection with Office document support
const getFileType = (mimeType: string, extension: string): string => {
  const mime = mimeType.toLowerCase();
  const ext = extension.toLowerCase().replace('.', '');
  
  // PDF files
  if (mime.includes('pdf') || ext === 'pdf') return 'pdf';
  
  // Microsoft Word documents
  if (mime.includes('word') || mime.includes('msword') || 
      ext === 'doc' || ext === 'docx') return 'word';
  
  // Microsoft PowerPoint
  if (mime.includes('powerpoint') || mime.includes('presentation') || 
      ext === 'ppt' || ext === 'pptx') return 'powerpoint';
  
  // Microsoft Excel
  if (mime.includes('excel') || mime.includes('spreadsheet') || 
      ext === 'xls' || ext === 'xlsx' || ext === 'csv') return 'excel';
  
  // Images
  if (mime.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) return 'image';
  
  // Video files
  if (mime.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) return 'video';
  
  // Audio files
  if (mime.includes('audio') || ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) return 'audio';
  
  // Text files
  if (mime.includes('text') || ext === 'txt') return 'text';
  
  // Web files
  if (ext === 'html' || ext === 'htm') return 'web';
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
  
  return 'unknown';
};

// Get comprehensive file type information - UPDATED WITH OFFICE PREVIEW SUPPORT
const getFileTypeInfo = (mimeType: string, extension: string, attachment?: DocumentAttachment) => {
  const fileType = getFileType(mimeType, extension);
  
  const typeMap = {
    pdf: {
      title: 'PDF Document',
      description: 'Portable Document Format - Universal document standard',
      icon: '📄',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      features: ['Universal compatibility', 'Print-ready format', 'Secure and reliable'],
      canPreview: true,
      previewType: 'iframe'
    },
    word: {
      title: 'Microsoft Word Document',
      description: 'Rich text document with advanced formatting capabilities',
      icon: '',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      features: ['Rich text formatting', 'Tables and images', 'Comments and track changes'],
      canPreview: true, // CHANGED: Now supports preview
      previewType: 'office'
    },
    powerpoint: {
      title: 'PowerPoint Presentation',
      description: 'Interactive presentation with slides and multimedia',
      icon: '📊',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      features: ['Slide presentations', 'Animations and transitions', 'Charts and multimedia'],
      canPreview: true, // CHANGED: Now supports preview
      previewType: 'office'
    },
    excel: {
      title: 'Excel Spreadsheet',
      description: 'Data analysis and calculation workbook',
      icon: '📈',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      features: ['Data tables and formulas', 'Charts and graphs', 'Multiple worksheets'],
      canPreview: true, // CHANGED: Now supports preview
      previewType: 'office'
    },
    image: {
      title: 'Image File',
      description: 'Visual content that can be displayed directly',
      icon: '🖼️',
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      features: ['Visual content', 'Direct preview', 'Multiple formats supported'],
      canPreview: true,
      previewType: 'image'
    },
    video: {
      title: 'Video File',
      description: 'Multimedia video content',
      icon: '🎥',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700',
      features: ['Video content', 'Multimedia player', 'Various formats'],
      canPreview: true,
      previewType: 'video'
    },
    audio: {
      title: 'Audio File',
      description: 'Sound or music content',
      icon: '🎵',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700',
      features: ['Audio content', 'Music player', 'Sound files'],
      canPreview: true,
      previewType: 'audio'
    },
    text: {
      title: 'Text Document',
      description: 'Plain text file with simple formatting',
      icon: '📝',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      features: ['Plain text content', 'Lightweight format', 'Universal compatibility'],
      canPreview: true,
      previewType: 'text'
    },
    web: {
      title: 'Web Document',
      description: 'HTML file that can be displayed in browser',
      icon: '🌐',
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-700',
      features: ['Web content', 'Hyperlinks', 'Styled formatting'],
      canPreview: true,
      previewType: 'iframe'
    },
    archive: {
      title: 'Archive File',
      description: 'Compressed file containing multiple documents',
      icon: '📦',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      features: ['Multiple files', 'Compressed format', 'Extraction required'],
      canPreview: false,
      previewType: 'download'
    },
    unknown: {
      title: 'Document File',
      description: 'File type that requires downloading to view',
      icon: '📎',
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-600',
      features: ['Unknown format', 'Download required', 'External application needed'],
      canPreview: false,
      previewType: 'download'
    }
  };

  return typeMap[fileType] || typeMap.unknown;
};

// OFFICE DOCUMENT PREVIEW SERVICES
const getOfficePreviewUrl = (documentPath: string, fileType: string, viewerService: 'microsoft' | 'google' = 'microsoft'): string => {
  // Ensure we have a full URL for the document
  const fullDocumentUrl = documentPath.startsWith('http') 
    ? documentPath 
    : `${window.location.origin}${documentPath}`;
  
  const encodedUrl = encodeURIComponent(fullDocumentUrl);
  
  if (viewerService === 'microsoft') {
    // Microsoft Office Online Viewer - More reliable for Office docs
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  } else {
    // Google Docs Viewer - Fallback option
    return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
  }
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  documentPath, 
  proposalName,
  attachment
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('unknown');
  const [viewerService, setViewerService] = useState<'microsoft' | 'google'>('microsoft');
  const [retryCount, setRetryCount] = useState(0);

  const mimeType = attachment?.mime || 'application/octet-stream';
  const extension = attachment?.ext || documentPath.split('.').pop() || '';
  const fileName = attachment?.name || proposalName;
  const fileSize = attachment?.size || 0;

  useEffect(() => {
    const detectedType = getFileType(mimeType, extension);
    setFileType(detectedType);
    console.log('DocumentViewer: File type detected:', detectedType, 'for', fileName);
    console.log('DocumentViewer: Document path:', documentPath);
    
    // Reset loading state for all previewable files
    if (['pdf', 'web', 'office'].includes(getFileTypeInfo(mimeType, extension).previewType)) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoading(false);
    }
  }, [mimeType, extension, fileName, documentPath]);

  // Handle iframe load events for previewable files
  useEffect(() => {
    const fileInfo = getFileTypeInfo(mimeType, extension);
    
    if (fileInfo.canPreview && iframeRef.current) {
      const iframe = iframeRef.current;
      
      const handleLoad = () => {
        console.log('DocumentViewer: Iframe loaded successfully');
        setIsLoading(false);
        setError(null);
      };
      
      const handleError = () => {
        console.error('DocumentViewer: Iframe failed to load');
        
        // For Office documents, try switching to Google Viewer as fallback
        if (fileInfo.previewType === 'office' && viewerService === 'microsoft' && retryCount < 1) {
          console.log('DocumentViewer: Switching to Google Viewer as fallback');
          setViewerService('google');
          setRetryCount(prev => prev + 1);
          setIsLoading(true);
          return;
        }
        
        setError('Failed to load document preview. The file may be corrupted or not accessible.');
        setIsLoading(false);
      };

      // Add event listeners
      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      // Fallback timeout - longer for Office documents
      const timeoutDelay = fileInfo.previewType === 'office' ? 15000 : 10000;
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn('DocumentViewer: Load timeout - assuming loaded');
          setIsLoading(false);
        }
      }, timeoutDelay);

      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
        clearTimeout(timeoutId);
      };
    }
  }, [fileType, isLoading, mimeType, extension, viewerService, retryCount]);

  const fileInfo = getFileTypeInfo(mimeType, extension, attachment);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Loading state
  if (isLoading && fileInfo.canPreview) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="animate-spin h-12 w-12 border-4 border-erm-primary border-t-transparent rounded-full"></div>
            <SolidDocumentTextIcon className="h-6 w-6 text-erm-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading document preview...</p>
          <p className="text-gray-500 text-sm mt-1">
            {fileInfo.previewType === 'office' 
              ? `Loading ${fileInfo.title} via ${viewerService === 'microsoft' ? 'Microsoft' : 'Google'} viewer...`
              : 'This may take a moment'
            }
          </p>
          <div className="mt-4 text-xs text-gray-400 max-w-md text-center">
            <p>URL: {documentPath}</p>
            <p>Type: {fileType}</p>
            <p>MIME: {mimeType}</p>
            {fileInfo.previewType === 'office' && (
              <p>Viewer: {viewerService === 'microsoft' ? 'Microsoft Office Online' : 'Google Docs'}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state with enhanced options for Office docs
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Preview Error</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="text-xs text-gray-500 mb-4">
            <p>Path: {documentPath}</p>
            <p>Type: {fileType}</p>
            {fileInfo.previewType === 'office' && (
              <p>Last tried: {viewerService === 'microsoft' ? 'Microsoft Office Online' : 'Google Docs'}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {fileInfo.previewType === 'office' && (
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  setRetryCount(0);
                  setViewerService(viewerService === 'microsoft' ? 'google' : 'microsoft');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Try {viewerService === 'microsoft' ? 'Google' : 'Microsoft'} Viewer
              </button>
            )}
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                setRetryCount(0);
                if (iframeRef.current) {
                  // Force reload the iframe
                  const currentSrc = iframeRef.current.src;
                  iframeRef.current.src = '';
                  setTimeout(() => {
                    if (iframeRef.current) {
                      iframeRef.current.src = currentSrc;
                    }
                  }, 100);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry Preview
            </button>
            <a
              href={documentPath}
              download={fileName}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download
            </a>
          </div>
        </div>
      </div>
    );
  }

  // PDF Preview - Enhanced
  if (fileType === 'pdf' && fileInfo.canPreview) {
    console.log('DocumentViewer: Rendering PDF iframe with path:', documentPath);
    return (
      <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-200">
        <iframe
          ref={iframeRef}
          src={`${documentPath}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
          title={fileName}
          className="w-full h-full border-0"
          allowFullScreen
          onLoad={() => {
            console.log('DocumentViewer: PDF iframe onLoad triggered');
            setIsLoading(false);
            setError(null);
          }}
          onError={(e) => {
            console.error('DocumentViewer: PDF iframe onError triggered', e);
            setError('Failed to load PDF document');
            setIsLoading(false);
          }}
        />
      </div>
    );
  }

  // OFFICE DOCUMENTS PREVIEW - NEW FEATURE
  if (fileInfo.previewType === 'office' && fileInfo.canPreview) {
    const previewUrl = getOfficePreviewUrl(documentPath, fileType, viewerService);
    console.log('DocumentViewer: Rendering Office document with URL:', previewUrl);
    
    return (
      <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-200">
        {/* Viewer Service Indicator */}
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Preview powered by:</span>
            <div className="flex items-center space-x-1">
              <img 
                src={viewerService === 'microsoft' 
                  ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjguNCIgaGVpZ2h0PSI4LjQiIGZpbGw9IiNGMjUwMjIiLz4KPHJlY3QgeD0iMTIuNiIgeT0iMyIgd2lkdGg9IjguNCIgaGVpZ2h0PSI4LjQiIGZpbGw9IiM3RkJBMDAiLz4KPHJlY3QgeD0iMyIgeT0iMTIuNiIgd2lkdGg9IjguNCIgaGVpZ2h0PSI4LjQiIGZpbGw9IiMwMEJDRjIiLz4KPHJlY3QgeD0iMTIuNiIgeT0iMTIuNiIgd2lkdGg9IjguNCIgaGVpZ2h0PSI4LjQiIGZpbGw9IiNGRkI5MDAiLz4KPC9zdmc+Cg=='
                  : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM0Mjg1RjQiLz4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIgZmlsbD0iI0ZGRiIvPgo8L3N2Zz4K'
                } 
                alt={viewerService} 
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">
                {viewerService === 'microsoft' ? 'Microsoft Office Online' : 'Google Docs'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setViewerService(viewerService === 'microsoft' ? 'google' : 'microsoft');
              setIsLoading(true);
              setError(null);
              setRetryCount(0);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Switch Viewer
          </button>
        </div>
        
        <iframe
          ref={iframeRef}
          src={previewUrl}
          title={fileName}
          className="w-full h-full border-0"
          allowFullScreen
          onLoad={() => {
            console.log('DocumentViewer: Office document iframe onLoad triggered');
            setIsLoading(false);
            setError(null);
          }}
          onError={(e) => {
            console.error('DocumentViewer: Office document iframe onError triggered', e);
            // Don't immediately error - the viewer services sometimes trigger false errors
            setTimeout(() => {
              if (isLoading) {
                setError(`Failed to load ${fileInfo.title} via ${viewerService === 'microsoft' ? 'Microsoft' : 'Google'} viewer`);
                setIsLoading(false);
              }
            }, 5000);
          }}
        />
      </div>
    );
  }

  // Web Preview
  if (fileType === 'web' && fileInfo.canPreview) {
    return (
      <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-200">
        <iframe
          ref={iframeRef}
          src={documentPath}
          title={fileName}
          className="w-full h-full border-0"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    );
  }

  // Image Preview
  if (fileType === 'image' && fileInfo.canPreview) {
    return (
      <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center p-4">
        <div className="max-w-full max-h-full flex items-center justify-center">
          <img
            src={documentPath}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('Failed to load image');
              setIsLoading(false);
            }}
          />
        </div>
      </div>
    );
  }

  // Video Preview
  if (fileType === 'video' && fileInfo.canPreview) {
    return (
      <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center p-4">
        <video
          src={documentPath}
          controls
          className="max-w-full max-h-full rounded-lg"
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setError('Failed to load video');
            setIsLoading(false);
          }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Audio Preview
  if (fileType === 'audio' && fileInfo.canPreview) {
    return (
      <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${fileInfo.color} flex items-center justify-center text-4xl text-white shadow-lg mb-6`}>
            {fileInfo.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">{fileName}</h3>
          <audio
            src={documentPath}
            controls
            className="w-full mb-4"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setError('Failed to load audio');
              setIsLoading(false);
            }}
          >
            Your browser does not support the audio tag.
          </audio>
          <p className="text-sm text-gray-600">
            Size: {formatFileSize(fileSize)}
          </p>
        </div>
      </div>
    );
  }

  // Text Preview
  if (fileType === 'text' && fileInfo.canPreview) {
    const [textContent, setTextContent] = useState<string>('');

    useEffect(() => {
      fetch(documentPath)
        .then(response => response.text())
        .then(text => {
          setTextContent(text);
          setIsLoading(false);
        })
        .catch(() => {
          setError('Failed to load text file');
          setIsLoading(false);
        });
    }, [documentPath]);

    return (
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-full overflow-auto p-6">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
            {textContent}
          </pre>
        </div>
      </div>
    );
  }

  // Enhanced preview card for non-previewable files
  return (
    <div className={`flex-1 flex items-center justify-center ${fileInfo.bgColor} rounded-lg border ${fileInfo.borderColor}`}>
      <div className="text-center p-8 max-w-lg mx-4">
        {/* File type icon and header */}
        <div className="relative mb-6">
          <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${fileInfo.color} flex items-center justify-center text-3xl shadow-lg`}>
            <span className="text-white text-3xl">{fileInfo.icon}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
            <EyeIcon className="h-4 w-4 text-gray-600" />
          </div>
        </div>

        {/* Document information */}
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{fileInfo.title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{fileInfo.description}</p>

        {/* File details card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 shadow-sm">
          <div className="text-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Document:</span>
              <span className="text-gray-900 truncate ml-2 max-w-48" title={fileName}>
                {fileName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Type:</span>
              <span className="text-gray-900 ml-2">{fileInfo.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Size:</span>
              <span className="text-gray-900 ml-2">{formatFileSize(fileSize)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Format:</span>
              <span className="text-gray-900 ml-2 uppercase">{extension.replace('.', '')}</span>
            </div>
          </div>
        </div>

        {/* Features list */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">File Features:</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {fileInfo.features.map((feature, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 border border-gray-200"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={documentPath}
            download={fileName}
            className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${fileInfo.color} text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium`}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Document
          </a>
          <button
            onClick={() => window.open(documentPath, '_blank')}
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 font-medium"
          >
            <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-2" />
            Open in New Tab
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-500 mt-6">
          💡 For the best viewing experience, download the document to use with its native application.
        </p>
      </div>
    </div>
  );
};

export default DocumentViewer;
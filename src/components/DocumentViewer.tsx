// src/components/DocumentViewer.tsx - FIXED VERSION WITH PROPER PREVIEW SUPPORT
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

// Enhanced file type detection
const getFileType = (mimeType: string, extension: string): string => {
  const mime = mimeType.toLowerCase();
  const ext = extension.toLowerCase().replace('.', '');
  
  console.log('🔍 DocumentViewer: Detecting file type:', { mime, ext });
  
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

// FIXED: Enhanced file type info with better preview logic
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
      icon: '📝',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      features: ['Rich text formatting', 'Tables and images', 'Comments and track changes'],
      canPreview: false, // Word docs typically can't be previewed directly
      previewType: 'download'
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
      canPreview: false,
      previewType: 'download'
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
      canPreview: false,
      previewType: 'download'
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

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  documentPath, 
  proposalName,
  attachment
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('unknown');

  // FIXED: Better handling of file properties
  const mimeType = attachment?.mime || 'application/octet-stream';
  const extension = attachment?.ext || documentPath.split('.').pop() || '';
  const fileName = attachment?.name || proposalName;
  const fileSize = attachment?.size || 0;

  // FIXED: Enhanced URL construction with debugging
  const getEffectiveDocumentUrl = (): string => {
    console.log('🔗 DocumentViewer: Constructing document URL...');
    console.log('📄 Document path:', documentPath);
    console.log('📎 Attachment:', attachment);
    
    if (!documentPath) {
      console.warn('⚠️ No document path provided');
      return '';
    }

    // If it's already a full URL, use it
    if (documentPath.startsWith('http://') || documentPath.startsWith('https://')) {
      console.log('✅ Using full URL:', documentPath);
      return documentPath;
    }

    // If it starts with /, it's a server path
    if (documentPath.startsWith('/')) {
      const fullUrl = `${window.location.origin}${documentPath}`;
      console.log('✅ Constructed server URL:', fullUrl);
      return fullUrl;
    }

    // Otherwise, assume it's a relative path
    const fullUrl = `${window.location.origin}/${documentPath}`;
    console.log('✅ Constructed relative URL:', fullUrl);
    return fullUrl;
  };

  const effectiveDocumentUrl = getEffectiveDocumentUrl();

  useEffect(() => {
    const detectedType = getFileType(mimeType, extension);
    setFileType(detectedType);
    console.log('🎯 DocumentViewer: File type detected:', detectedType, 'for', fileName);
    console.log('📊 File details:', { mimeType, extension, fileSize, effectiveDocumentUrl });
    
    // For non-previewable files, stop loading immediately
    const fileInfo = getFileTypeInfo(mimeType, extension, attachment);
    if (!fileInfo.canPreview) {
      console.log('❌ File type cannot be previewed:', detectedType);
      setIsLoading(false);
      return;
    }

    // For previewable files, let the iframe/element handle loading
    console.log('✅ File type can be previewed:', detectedType);
  }, [mimeType, extension, fileName, effectiveDocumentUrl, attachment]);

  // FIXED: Better iframe load handling
  useEffect(() => {
    if (!(['pdf', 'web'].includes(fileType)) || !iframeRef.current) {
      return;
    }

    const iframe = iframeRef.current;
    
    const handleLoad = () => {
      console.log('✅ Iframe loaded successfully');
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = (e: any) => {
      console.error('❌ Iframe load error:', e);
      setError(`Failed to load document preview. The file may not be accessible or may require download.`);
      setIsLoading(false);
    };

    // FIXED: Better event handling
    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Test if the URL is accessible
    fetch(effectiveDocumentUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          console.warn('⚠️ Document URL not accessible via fetch:', response.status);
        }
      })
      .catch(fetchError => {
        console.warn('⚠️ Document URL fetch test failed:', fetchError);
      });

    // Fallback timeout for loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('⏱️ Preview load timeout - assuming loaded');
        setIsLoading(false);
      }
    }, 10000); // Increased timeout

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      clearTimeout(timeoutId);
    };
  }, [fileType, isLoading, effectiveDocumentUrl]);

  const fileInfo = getFileTypeInfo(mimeType, extension, attachment);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // FIXED: Show debug info in development
  const isDebug = process.env.NODE_ENV === 'development';

  // Loading state for previewable files
  if (isLoading && fileInfo.canPreview) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="animate-spin h-12 w-12 border-4 border-erm-primary border-t-transparent rounded-full"></div>
            <SolidDocumentTextIcon className="h-6 w-6 text-erm-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading document preview...</p>
          <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
          {isDebug && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-left">
              <div>URL: {effectiveDocumentUrl}</div>
              <div>Type: {fileType}</div>
              <div>MIME: {mimeType}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Preview Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          {isDebug && (
            <div className="mb-4 p-2 bg-red-100 rounded text-xs text-left">
              <div>URL: {effectiveDocumentUrl}</div>
              <div>Type: {fileType}</div>
              <div>MIME: {mimeType}</div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Force iframe reload
                if (iframeRef.current) {
                  iframeRef.current.src = effectiveDocumentUrl;
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry Preview
            </button>
            <a
              href={effectiveDocumentUrl}
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

  // FIXED: Enhanced PDF Preview with better error handling
  if (fileType === 'pdf' && fileInfo.canPreview) {
    return (
      <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-200">
        {isDebug && (
          <div className="p-2 bg-yellow-50 border-b text-xs">
            <strong>Debug:</strong> Loading PDF from: {effectiveDocumentUrl}
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={effectiveDocumentUrl}
          title={fileName}
          className="w-full h-full border-0"
          allowFullScreen
          onLoad={() => {
            console.log('✅ PDF iframe loaded');
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error('❌ PDF iframe error:', e);
            setError('PDF preview failed to load. The file may be corrupted or inaccessible.');
          }}
        />
      </div>
    );
  }

  // Web/HTML Preview
  if (fileType === 'web' && fileInfo.canPreview) {
    return (
      <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-200">
        {isDebug && (
          <div className="p-2 bg-yellow-50 border-b text-xs">
            <strong>Debug:</strong> Loading HTML from: {effectiveDocumentUrl}
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={effectiveDocumentUrl}
          title={fileName}
          className="w-full h-full border-0"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    );
  }

  // FIXED: Enhanced Image Preview
  if (fileType === 'image' && fileInfo.canPreview) {
    return (
      <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center p-4">
        {isDebug && (
          <div className="absolute top-2 left-2 p-2 bg-yellow-50 rounded text-xs z-10">
            URL: {effectiveDocumentUrl}
          </div>
        )}
        <div className="max-w-full max-h-full flex items-center justify-center">
          <img
            src={effectiveDocumentUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            onLoad={() => {
              console.log('✅ Image loaded successfully');
              setIsLoading(false);
            }}
            onError={(e) => {
              console.error('❌ Image load error:', e);
              setError('Failed to load image. The file may not be accessible.');
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
          src={effectiveDocumentUrl}
          controls
          className="max-w-full max-h-full rounded-lg"
          onLoadedData={() => {
            console.log('✅ Video loaded successfully');
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error('❌ Video load error:', e);
            setError('Failed to load video. The file may not be accessible.');
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
            src={effectiveDocumentUrl}
            controls
            className="w-full mb-4"
            onLoadedData={() => setIsLoading(false)}
            onError={(e) => {
              console.error('❌ Audio load error:', e);
              setError('Failed to load audio file.');
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
      fetch(effectiveDocumentUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.text();
        })
        .then(text => {
          console.log('✅ Text file loaded successfully');
          setTextContent(text);
          setIsLoading(false);
        })
        .catch(fetchError => {
          console.error('❌ Text file load error:', fetchError);
          setError(`Failed to load text file: ${fetchError.message}`);
          setIsLoading(false);
        });
    }, [effectiveDocumentUrl]);

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
            {isDebug && (
              <div className="flex justify-between items-center border-t pt-2 mt-2">
                <span className="font-medium text-gray-700">Debug URL:</span>
                <span className="text-gray-900 ml-2 text-xs truncate max-w-32" title={effectiveDocumentUrl}>
                  {effectiveDocumentUrl}
                </span>
              </div>
            )}
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
            href={effectiveDocumentUrl}
            download={fileName}
            className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${fileInfo.color} text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium`}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Document
          </a>
          <button
            onClick={() => window.open(effectiveDocumentUrl, '_blank')}
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
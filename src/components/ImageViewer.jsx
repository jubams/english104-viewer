import './ImageViewer.css';

function ImageViewer({ src, alt, className = '' }) {
  return (
    <div className={`image-viewer ${className}`}>
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}

export default ImageViewer;

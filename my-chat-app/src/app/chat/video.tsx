import { Box, AspectRatio, Link } from '@chakra-ui/react';

const videoId = 'apUbswdfJRA';

const youtubeParams = new URLSearchParams({
    autoplay: '1', // Autoplay the video
    loop: '1', // Loop the video playback
    allowfullscreen: '1', // Allow fullscreen mode
    playlist: videoId, // Play the video on loop
});

export function VideoComponent() {
 // Replace with the actual video ID from the URL
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?${youtubeParams.toString()}`;

  const handleIframeLoad = () => {
    // Optional: You can perform an action after the iframe loads here
  };

  return (
    <AspectRatio ratio={300 / 436.36}>
      <iframe
        id="ytplayer"
        type="text/html"
        width="640"
        height="360"
        src={youtubeUrl}
        frameborder="0"
        allowfullscreen
        onLoad={handleIframeLoad}
      />
    </AspectRatio>
  );
}

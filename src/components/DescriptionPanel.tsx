// src/components/DescriptionPanel.tsx
import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';

interface DescriptionPanelProps {
  description: string;
  onRatingSubmit: (rating: number, comment: string) => void;
}

const DescriptionPanel: React.FC<DescriptionPanelProps> = ({ description, onRatingSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onRatingSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  return (
    // This container is now just a standard block within the parent's scroll area
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex-shrink-0"> {/* Removed flex-1, min-h-0, flex-col, added bg/shadow/border/padding */}
      
      {/* Panel Title */}
      <h3 className="text-xl font-bold text-text-dark-gray mb-4">Description</h3>
      
      {/* This div contains both the description text and the ratings/comments section */}
      {/* It no longer has overflow-y-auto; scrolling is handled by its parent in DescriptionView */}
      <div className="flex flex-col"> {/* Kept flex-col to stack inner content, removed scrolling */}
        {/* Description Text */}
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-6">
          {description || 'No detailed description available.'}
        </p>

        {/* Ratings Section - now visually integrated within this content block */}
        <div className="pt-6 border-t border-gray-200 mt-auto flex-shrink-0"> {/* mt-auto might not be needed as much, but keep for spacing */}
          <h3 className="text-lg font-bold text-text-dark-gray mb-3">Rate this document</h3>
          <div className="flex items-center space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`h-7 w-7 cursor-pointer transition-colors duration-150
                            ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'}`}
                onClick={() => setRating(star)}
              />
            ))}
            {rating > 0 && <span className="ml-2 text-text-medium-gray">{rating} / 5 Stars</span>}
          </div>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-strapi-green-light resize-y mb-3"
            rows={3}
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="px-6 py-2 bg-strapi-green-light text-white font-semibold rounded-lg disabled:opacity-50
                       hover:bg-strapi-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
          >
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionPanel;
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
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6"> {/* Added consistent padding */}
      <h3 className="text-xl font-bold text-text-dark-gray mb-4">Description</h3>
      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-8">
        {description || 'No detailed description available.'}
      </p>

      {/* Ratings Section */}
      <div className="pt-6 border-t border-gray-200">
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
  );
};

export default DescriptionPanel;
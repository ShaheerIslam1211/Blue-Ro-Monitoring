import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Typography } from "@material-tailwind/react";

export function InstructionsCard({ instructions }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CheckCircleIcon className="h-6 w-6 text-blue-500" />
          </div>
          <Typography variant="h5" className="font-medium text-gray-800">
            Instructions
          </Typography>
        </div>

        {/* Instructions List */}
        <div className="space-y-4">
          {instructions.map((instruction, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-medium text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <Typography className="text-gray-700 leading-relaxed">
                  {instruction.text}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstructionsCard; 
// components/TreeNode.js
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Scale, BookOpen, Brain, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const getIconByType = (type, data) => {
  switch(type) {
    case 'claim': return <BookOpen className="w-4 h-4 text-blue-500" />;
    case 'nli':
      if (data?.label === 'contradiction') return <XCircle className="w-4 h-4 text-red-500" />;
      if (data?.label === 'entailment') return <CheckCircle className="w-4 h-4 text-green-500" />;
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'debate': return <Scale className="w-4 h-4 text-purple-500" />;
    case 'final': return <Brain className="w-4 h-4 text-indigo-500" />;
    default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

const TreeNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  if (!node) return null;

  return (
    <div style={{ marginLeft: `${level * 1}rem` }} className="border-l-2 border-gray-200 pl-4 py-2">
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {node.children && node.children.length > 0 && (
          isExpanded ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />
        )}
        <div className="flex-shrink-0">{getIconByType(node.type, node.data)}</div>
        <span className="font-medium text-sm">{node.title}</span>
      </div>

      {node.content && (
        <div className="ml-6 text-xs text-gray-600 bg-gray-50 p-3 rounded mt-1 break-words">
          {typeof node.content === 'string' ? node.content : JSON.stringify(node.content, null, 2)}
        </div>
      )}

      {isExpanded && node.children && node.children.map((child, idx) => (
        <TreeNode key={idx} node={child} level={level + 1} />
      ))}
    </div>
  );
};

export default TreeNode;

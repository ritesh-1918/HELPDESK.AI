import React, { useState, useEffect, useMemo } from 'react';

// Modern curated color palette (HSL) for node types
const TYPE_COLORS = {
  SERVER: { bg: 'hsl(217, 91%, 60%)', border: 'hsl(217, 91%, 45%)', text: '#ffffff' },
  DATABASE: { bg: 'hsl(142, 71%, 45%)', border: 'hsl(142, 71%, 30%)', text: '#ffffff' },
  SERVICE: { bg: 'hsl(270, 76%, 60%)', border: 'hsl(270, 76%, 45%)', text: '#ffffff' },
  APPLICATION: { bg: 'hsl(339, 90%, 60%)', border: 'hsl(339, 90%, 45%)', text: '#ffffff' },
  API: { bg: 'hsl(32, 98%, 50%)', border: 'hsl(32, 98%, 40%)', text: '#ffffff' },
  TEAM: { bg: 'hsl(175, 75%, 40%)', border: 'hsl(175, 75%, 30%)', text: '#ffffff' },
  TICKET: { bg: 'hsl(0, 84%, 60%)', border: 'hsl(0, 84%, 45%)', text: '#ffffff' },
  ERROR_CODE: { bg: 'hsl(28, 90%, 55%)', border: 'hsl(28, 90%, 40%)', text: '#ffffff' },
  UNKNOWN: { bg: 'hsl(200, 10%, 50%)', border: 'hsl(200, 10%, 40%)', text: '#ffffff' }
};

export default function KnowledgeGraphViewer({ ticketContext = null }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [showCauseEffectOnly, setShowCauseEffectOnly] = useState(false);

  // Position nodes dynamically
  const [nodePositions, setNodePositions] = useState({});

  useEffect(() => {
    async function loadGraphData() {
      try {
        setLoading(true);
        // Fetch nodes & edges from our new backend APIs
        const nodesRes = await fetch('http://localhost:8000/ai/knowledge_graph/nodes');
        const edgesRes = await fetch('http://localhost:8000/ai/knowledge_graph/edges');
        
        if (!nodesRes.ok || !edgesRes.ok) {
          throw new Error('Failed to retrieve knowledge graph metadata');
        }
        
        const nodesData = await nodesRes.json();
        const edgesData = await edgesRes.json();
        
        setNodes(nodesData);
        setEdges(edgesData);
        
        // Compute positions (Circular layout for predictability and neat visualization)
        const positions = {};
        const radius = 220;
        const centerX = 350;
        const centerY = 280;
        
        nodesData.forEach((node, index) => {
          const angle = (index / nodesData.length) * 2 * Math.PI;
          positions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          };
        });
        
        setNodePositions(positions);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadGraphData();
  }, []);

  // Filter nodes & edges
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            node.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedTypeFilter === 'ALL' || node.type === selectedTypeFilter;
      
      if (showCauseEffectOnly && ticketContext?.cause_effect_chain) {
        return ticketContext.cause_effect_chain.includes(node.id);
      }
      
      return matchesSearch && matchesType;
    });
  }, [nodes, searchTerm, selectedTypeFilter, showCauseEffectOnly, ticketContext]);

  const filteredEdges = useMemo(() => {
    const activeNodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(edge => {
      return activeNodeIds.has(edge.source_id) && activeNodeIds.has(edge.target_id);
    });
  }, [edges, filteredNodes]);

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Selected node relationships details
  const nodeRelationships = useMemo(() => {
    if (!selectedNodeId) return [];
    return edges.filter(e => e.source_id === selectedNodeId || e.target_id === selectedNodeId)
      .map(e => {
        const isSource = e.source_id === selectedNodeId;
        const partnerId = isSource ? e.target_id : e.source_id;
        const partnerNode = nodes.find(n => n.id === partnerId);
        return {
          type: e.relationship_type,
          partnerName: partnerNode ? partnerNode.name : partnerId,
          partnerType: partnerNode ? partnerNode.type : 'UNKNOWN',
          direction: isSource ? 'outgoing' : 'incoming'
        };
      });
  }, [edges, selectedNodeId, nodes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-slate-400 font-medium animate-pulse">Initializing Knowledge Graph Orchestration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-slate-900 border border-red-900/30 rounded-2xl shadow-xl text-center">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <h4 className="text-slate-200 font-bold mb-2">Knowledge Graph Offline</h4>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-2xl text-slate-100 font-sans">
      
      {/* Search & Controller Side Panel */}
      <div className="flex flex-col gap-5 bg-slate-950/50 border border-slate-800/60 rounded-xl p-5 shadow-inner">
        <div>
          <h3 className="text-lg font-bold text-emerald-400 mb-1">Entity Intelligence</h3>
          <p className="text-xs text-slate-400">Search and navigate structural infrastructure dependencies.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search servers, databases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 pl-9 text-sm text-slate-100 focus:outline-none transition-colors"
          />
          <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
        </div>

        {/* Type Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Filter Entity Type</label>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            {Object.keys(TYPE_COLORS).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Cause-Effect toggle for active ticket */}
        {ticketContext?.cause_effect_chain && (
          <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-emerald-400">Incident Propagation Path</span>
              <span className="text-xs text-slate-400">Show root cause triggers</span>
            </div>
            <button
              onClick={() => setShowCauseEffectOnly(!showCauseEffectOnly)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${showCauseEffectOnly ? 'bg-emerald-500' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${showCauseEffectOnly ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        )}

        {/* Selected Node Details */}
        <div className="flex-1 border-t border-slate-800/80 pt-4">
          {selectedNode ? (
            <div className="flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full border"
                  style={{
                    backgroundColor: TYPE_COLORS[selectedNode.type]?.bg || TYPE_COLORS.UNKNOWN.bg,
                    borderColor: TYPE_COLORS[selectedNode.type]?.border || TYPE_COLORS.UNKNOWN.border
                  }}
                />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedNode.type}</span>
              </div>
              
              <h4 className="text-base font-extrabold text-slate-100">{selectedNode.name}</h4>
              <p className="text-xs text-slate-400 font-mono bg-slate-900/80 p-2 rounded border border-slate-850">ID: {selectedNode.id}</p>

              {/* Node Metadata Properties */}
              <div className="flex flex-col gap-1.5 mt-2">
                <h5 className="text-xs font-bold uppercase text-slate-500">Node Configuration</h5>
                <div className="max-h-[120px] overflow-y-auto pr-1 flex flex-col gap-1 text-xs text-slate-350">
                  {Object.entries(selectedNode.metadata || {}).map(([key, val]) => (
                    key !== 'aliases' && (
                      <div key={key} className="flex justify-between py-1 border-b border-slate-900/40">
                        <span className="font-semibold text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-slate-250 truncate max-w-[140px]">{String(val)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Relationships */}
              <div className="flex flex-col gap-2 mt-2">
                <h5 className="text-xs font-bold uppercase text-slate-500">Structural Links ({nodeRelationships.length})</h5>
                <div className="max-h-[140px] overflow-y-auto flex flex-col gap-1">
                  {nodeRelationships.map((rel, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/35 text-[11px]">
                      <span className="text-slate-400 font-medium">
                        {rel.direction === 'outgoing' ? '➔' : '⇠'} {rel.partnerName}
                      </span>
                      <span className="text-emerald-400 font-semibold uppercase text-[9px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">
                        {rel.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl h-full min-h-[180px]">
              <span className="text-2xl mb-2">🕸️</span>
              <p className="text-xs text-slate-400">Select a node on the canvas to inspect dependencies, owner teams, and alert propagations.</p>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas Board */}
      <div className="lg:col-span-2 relative bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden shadow-inner flex items-center justify-center min-h-[450px]">
        {/* Neon Glow filters for premium visual visualizer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ visibility: 'hidden', position: 'absolute' }}>
          <defs>
            <filter id="neon-glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neon-glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Primary Interactive Graph Render */}
        <svg viewBox="0 0 700 560" className="w-full h-full max-h-[560px] cursor-grab select-none">
          {/* Render Connection Edges */}
          <g>
            {filteredEdges.map((edge, idx) => {
              const posS = nodePositions[edge.source_id];
              const posT = nodePositions[edge.target_id];
              
              if (!posS || !posT) return null;
              
              // Verify if edge is part of cause effect chain
              const isCausePath = ticketContext?.cause_effect_chain &&
                                  ticketContext.cause_effect_chain.includes(edge.source_id) &&
                                  ticketContext.cause_effect_chain.includes(edge.target_id);

              return (
                <g key={edge.id || idx}>
                  <line
                    x1={posS.x}
                    y1={posS.y}
                    x2={posT.x}
                    y2={posT.y}
                    stroke={isCausePath ? 'hsl(0, 84%, 60%)' : 'rgba(100, 116, 139, 0.4)'}
                    strokeWidth={isCausePath ? 3.5 : 1.5}
                    strokeDasharray={isCausePath ? '8,5' : 'none'}
                    className={isCausePath ? 'animate-dash' : ''}
                    filter={isCausePath ? 'url(#neon-glow-red)' : ''}
                  />
                  {/* Small relationship type badge on line midpoint */}
                  <text
                    x={(posS.x + posT.x) / 2}
                    y={(posS.y + posT.y) / 2 - 5}
                    fill={isCausePath ? 'hsl(0, 84%, 75%)' : '#64748b'}
                    fontSize="9px"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="bg-slate-950 px-1 py-0.5 rounded pointer-events-none uppercase tracking-wider"
                  >
                    {edge.relationship_type}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Render Active Nodes */}
          <g>
            {filteredNodes.map(node => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              
              const isSelected = selectedNodeId === node.id;
              const style = TYPE_COLORS[node.type] || TYPE_COLORS.UNKNOWN;
              const isCauseChainNode = ticketContext?.cause_effect_chain && 
                                       ticketContext.cause_effect_chain.includes(node.id);

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer group"
                >
                  {/* Glowing outer circle indicator */}
                  <circle
                    r={isSelected ? 26 : (isCauseChainNode ? 22 : 18)}
                    fill="none"
                    stroke={isSelected ? 'hsl(142, 71%, 45%)' : (isCauseChainNode ? 'hsl(0, 84%, 60%)' : style.border)}
                    strokeWidth={isSelected ? 3 : 1.5}
                    filter={isSelected ? 'url(#neon-glow-emerald)' : (isCauseChainNode ? 'url(#neon-glow-red)' : '')}
                    className="transition-all duration-300 group-hover:scale-110"
                  />
                  {/* Inner color filled circle */}
                  <circle
                    r={isSelected ? 20 : (isCauseChainNode ? 17 : 14)}
                    fill={style.bg}
                    stroke={style.border}
                    strokeWidth={1}
                  />
                  {/* Label tag */}
                  <text
                    y={32}
                    fill={isSelected ? '#10b981' : '#cbd5e1'}
                    fontSize={isSelected ? '12px' : '10px'}
                    fontWeight={isSelected || isCauseChainNode ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow"
                  >
                    {node.name}
                  </text>
                  
                  {/* Little icon representation */}
                  <text
                    y={4}
                    fill="#ffffff"
                    fontSize={isSelected ? '11px' : '9px'}
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {node.type[0]}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 max-w-[85%] bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[9px] shadow-lg pointer-events-none">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.bg }} />
              <span className="text-slate-300 font-semibold">{type}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Styles for stroke animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash {
          animation: dash 1s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}

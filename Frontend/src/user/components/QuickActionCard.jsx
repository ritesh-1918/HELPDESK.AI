import React from 'react';
 
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const QuickActionCard = ({ icon: Icon, title, description, colorClass }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            <Card
                onClick={() => navigate('/create-ticket')}
                className="group flex flex-col items-start p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-emerald-600/50 text-left w-full cursor-pointer transition-colors"
            >
                <div className={`size-12 rounded-lg ${colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-1 tracking-tight">{title}</h4>
                <p className="text-sm text-slate-500/60 font-semibold leading-relaxed">{description}</p>
            </Card>
        </motion.div>
    );
};

export default QuickActionCard;

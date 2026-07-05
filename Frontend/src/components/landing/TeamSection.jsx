import React from 'react';
import { Github, Linkedin } from 'lucide-react';


const TEAM_MEMBERS = [
    // --- COORDINATION TEAM ---
    {
        name: "Duniya Vasa",
        role: "Group Lead",
        team: "Coordination",
        image: "/team/duniya_vasa.jpg",
        linkedin: "https://www.linkedin.com/in/duniyavasa/",
        github: "https://github.com/Duniya-24"
    },
    {
        name: "Sowjanya N",
        role: "Member",
        team: "Coordination",
        image: "/team/sowjanya_n.jpg",
        linkedin: "https://www.linkedin.com/in/sowjanya-n-962319354",
        github: "https://github.com/Sowji0118/"
    },

    // --- MODEL TEAM ---
    {
        name: "Pragati Tiwari",
        role: "Lead",
        team: "Model",
        image: "/team/pragati_tiwari.jpg",
        linkedin: "https://linkedin.com/in/pragati-tiwari-608b043b5",
        github: "https://github.com/pTIWARI-20"
    },
    {
        name: "Shaik Eshak",
        role: "Member",
        team: "Model",
        image: "/team/shaik_eshak.jpg",
        linkedin: "https://www.linkedin.com/in/eshak-s-16738626a/",
        github: "https://github.com/Eshakshai"
    },
    {
        name: "Ippili Raju",
        role: "Member",
        team: "Model",
        image: "/team/ippili_raju.jpg",
        linkedin: "https://www.linkedin.com/in/raju-ippili-419051308/",
        github: "https://github.com/raju-ippili"
    },
    {
        name: "Vinitha Giri",
        role: "Member",
        team: "Model",
        image: "/team/vinitha_giri.jpg",
        linkedin: "https://www.linkedin.com/in/vinitha-giri/",
        github: "https://github.com/vinitha-giri"
    },
    {
        name: "Asna Abdul Kareem",
        role: "Member",
        team: "Model",
        image: "/team/asna_abdul_kareem.jpg",
        linkedin: "https://in.linkedin.com/in/asna-abdul-kareem-6774a6292",
        github: "https://github.com/Asnaabdul"
    },
    {
        name: "Ritesh Bonthalakoti",
        role: "Member",
        team: "Model",
        image: "/team/ritesh_bonthalakoti.jpg",
        linkedin: "https://www.linkedin.com/in/ritesh1908",
        github: "https://github.com/ritesh-1918"
    },

    // --- BACKEND TEAM ---
    {
        name: "Asmeet Kaur Makkad",
        role: "Lead",
        team: "Backend",
        image: "/team/asmeet_kaur_makkad.jpg",
        linkedin: "https://www.linkedin.com/in/asmeet-kaur-makkad-911bb3304",
        github: "https://github.com/AsmeetKaurMakkad"
    },
    {
        name: "Vijayalakshmi S R",
        role: "Member",
        team: "Backend",
        image: "/team/vijayalakshmi_s_r.jpg",
        linkedin: "https://www.linkedin.com/in/vijayalakshmi-s-r-6a260228a/",
        github: "https://github.com/Vijayalakshmi1412"
    },
    {
        name: "Dinesh Reddy Vasampelli",
        role: "Member",
        team: "Backend",
        image: "/team/dinesh_reddy_vasampelli.jpg",
        linkedin: "https://www.linkedin.com/in/dineshreddy-vasampelli-b11046296/",
        github: "https://github.com/vasampellidineshreddy18-bot"
    },
    {
        name: "Manya Sahasra",
        role: "Member",
        team: "Backend",
        image: "/team/manya_sahasra.jpg",
        linkedin: "www.linkedin.com/in/manya2929",
        github: "https://github.com/ManyaSaaha9"
    },

    // --- FRONTEND TEAM ---
    {
        name: "Satla Prayukthika",
        role: "Lead",
        team: "Frontend",
        image: "/team/satla_prayukthika.jpg",
        linkedin: "https://www.linkedin.com/in/satla-prayukthika-328114291/",
        github: "https://github.com/prayukthika03"
    },
    {
        name: "Bandi Keerthi Krishna",
        role: "Member",
        team: "Frontend",
        image: "/team/bandi_keerthi_krishna.jpg",
        linkedin: "https://www.linkedin.com/in/bandikeerthikrishna",
        github: "https://github.com/bKeerthi-1205"
    },
    {
        name: "Shubha G D",
        role: "Member",
        team: "Frontend",
        image: "/team/shubha_g_d.jpg",
        linkedin: "https://www.linkedin.com/in/shubha-g-d-a879003b5",
        github: "https://github.com/gdshubha148"
    },
    {
        name: "Phani Kotha",
        role: "Member",
        team: "Frontend",
        image: "/team/kpvvssmphara.jpg",
        linkedin: "https://www.linkedin.com/in/phani-kotha-26073439b",
        github: "https://github.com/phanikotha18-sudo"
    },

    // --- DATA TEAM ---
    {
        name: "Praneetha Baru",
        role: "Lead",
        team: "Data",
        image: "/team/praneetha_baru.jpg",
        linkedin: "https://www.linkedin.com/in/praneetha-baru-0846b0295",
        github: "https://github.com/Praneetha7305"
    },
    {
        name: "Kavin Sarvesh",
        role: "Member",
        team: "Data",
        image: "/team/kavin_sarvesh.jpg",
        linkedin: "https://www.linkedin.com/in/kavin-sarvesh-813437360",
        github: "https://github.com/Kavinsarvesh2006"
    },
    {
        name: "Utukuri Naga Sri Hari Chandana",
        role: "Member",
        team: "Data",
        image: "/team/utukuri_naga_sri_hari_chandana.jpg",
        linkedin: "https://www.linkedin.com/in/naga-sri-hari-chandana-utukuri-541b072a3",
        github: "https://github.com/2300031149-chandana"
    },
    {
        name: "Akash Kumar Paswan",
        role: "Member",
        team: "Data",
        image: "/team/akash_kumar_paswan.jpg",
        linkedin: "https://www.linkedin.com/in/akash-kumar-paswan-951a13361",
        github: "https://github.com/Akashpaswan302"
    },
    {
        name: "Ganesh Goud Tekmul",
        role: "Member",
        team: "Data",
        image: "/team/ganesh_goud_tekmul.jpg",
        linkedin: "https://www.linkedin.com/in/ganesh-goud-a55a8b373/",
        github: "https://github.com/ganeshgoud96"
    }
];

// Helper to group members by team
const TEAM_GROUPS = [
    { id: 'Coordination', label: 'Leadership & Coordination' },
    { id: 'Model', label: 'AI & Modeling' },
    { id: 'Backend', label: 'Backend Engineering' },
    { id: 'Frontend', label: 'Frontend Engineering' },
    { id: 'Data', label: 'Data Engineering' }
];

export default function TeamSection() {
    return (
        <section className="py-24 bg-gray-50/50 border-t border-gray-100">
            <div className="max-w-[1100px] mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                        Meet the Team Behind helpdesk.ai
                    </h2>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                        Built by engineers focused on intelligent support automation.
                    </p>
                </div>

                {/* Grouped by Team */}
                <div className="space-y-20">
                    {TEAM_GROUPS.map((group) => {
                        const groupMembers = TEAM_MEMBERS.filter(m => m.team === group.id);
                        if (groupMembers.length === 0) return null;

                        return (
                            <div key={group.id}>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest border-b border-gray-200 pb-2 mb-8 inline-block">
                                    {group.label}
                                </h3>

                                {/* Responsive Grid Layout */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                                    {groupMembers.map((member, index) => (
                                        <div
                                            key={index}
                                            className="group relative bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col items-center text-center"
                                        >
                                            {/* Image Container with Hover Overlay */}
                                            <div className="relative w-32 h-32 mb-5 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100/50">
                                                {member.image ? (
                                                    <img
                                                        src={member.image}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            // If image fails to load, fallback to a placeholder
                                                            e.target.onerror = null;
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=10b981&color=fff&size=128`;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-3xl">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                )}

                                                {/* Emerald Overlay on Hover */}
                                                <div className="absolute inset-0 bg-emerald-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                                                    {member.github && (
                                                        <a
                                                            href={member.github.startsWith('http') ? member.github : `https://${member.github}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-10 h-10 rounded-full bg-white text-emerald-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                                            aria-label={`${member.name}'s GitHub`}
                                                        >
                                                            <Github size={20} className="fill-current" />
                                                        </a>
                                                    )}
                                                    {member.linkedin && (
                                                        <a
                                                            href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-10 h-10 rounded-full bg-white text-emerald-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                                            aria-label={`${member.name}'s LinkedIn`}
                                                        >
                                                            <Linkedin size={20} className="fill-current" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Text Content */}
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{member.name}</h3>
                                                <p className={`text-[11px] font-black uppercase tracking-widest ${member.role.includes('Lead') ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

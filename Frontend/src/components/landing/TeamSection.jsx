import React from 'react';
import { Github, Linkedin } from 'lucide-react';

const TEAM_MEMBERS = [
    {
        name: "Ritesh Bonthalakoti",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1pqJyn9w_mWV4nY4v9rSw0H1BdxxKhr4g",
        linkedin: "https://www.linkedin.com/in/ritesh1908",
        github: "https://github.com/ritesh-1918"
    },
    {
        name: "Kavin Sarvesh",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1nIbvrpmhBCOWhRxqaVgdD-ZRpod8xd7c",
        linkedin: "https://www.linkedin.com/in/kavin-sarvesh-813437360",
        github: "https://github.com/Kavinsarvesh2006"
    },
    {
        name: "Vijayalakshmi S R",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1x7F86fkUQFsJu7k0hq4sC06gBGCZTisf",
        linkedin: "https://www.linkedin.com/in/vijayalakshmi-s-r-6a260228a/",
        github: "https://github.com/Vijayalakshmi1412"
    },
    {
        name: "Dinesh Reddy Vasampelli",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1rksSBwXI0CV86KNA1dw2hZJZ-wlQBuuX",
        linkedin: "https://www.linkedin.com/in/dineshreddy-vasampelli-b11046296/",
        github: "https://github.com/vasampellidineshreddy18-bot"
    },
    {
        name: "Utukuri Naga Sri Hari Chandana",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=18L-elaSfEEhGt7B37QTkzBhu3vikLbJh",
        linkedin: "https://www.linkedin.com/in/naga-sri-hari-chandana-utukuri-541b072a3",
        github: "https://github.com/2300031149-chandana"
    },
    {
        name: "Duniya Vasa",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1Q9gxRFdNT6RAVRXPD2dYrc07OHYzHIxP",
        linkedin: "https://www.linkedin.com/in/duniyavasa/",
        github: "https://github.com/Duniya-24"
    },
    {
        name: "Vinitha Giri",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1vnpYlemu5oz0ZcxwLL-9pIyoOjCkF7bA",
        linkedin: "https://www.linkedin.com/in/vinitha-giri/",
        github: "https://github.com/vinitha-giri"
    },
    {
        name: "Bandi Keerthi Krishna",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1xiRmBxxi43IKFeLG92W5qxmCARhNd6mf",
        linkedin: "https://www.linkedin.com/in/bandikeerthikrishna",
        github: "https://github.com/bKeerthi-1205"
    },
    {
        name: "Ippili Raju",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1k1CBjv4vJWNVuqVg6-gs2Z8Hom34zqP-",
        linkedin: "https://www.linkedin.com/in/raju-ippili-419051308/",
        github: "https://github.com/raju-ippili"
    },
    {
        name: "Satla Prayukthika",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1kDcPMlnnuzsUAGI1SI9lrwOIUaquUNqP",
        linkedin: "https://www.linkedin.com/in/satla-prayukthika-328114291/",
        github: "https://github.com/prayukthika03"
    },
    {
        name: "Akash Kumar Paswan",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1KnnAgBq6lfQETyqoJU9Ql2Vk40bU9wxf",
        linkedin: "https://www.linkedin.com/in/akash-kumar-paswan-951a13361",
        github: "https://github.com/Akashpaswan302"
    },
    {
        name: "Shubha G D",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1LTkUcd1YkfzP2kqK53z2IM3WYG4HPG1w",
        linkedin: "https://www.linkedin.com/in/shubha-g-d-a879003b5",
        github: "https://github.com/gdshubha148"
    },
    {
        name: "Asmeet Kaur Makkad",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1w8aoWQ46P_trcrfa61xiMG74RmxqiGPu",
        linkedin: "https://www.linkedin.com/in/asmeet-kaur-makkad-911bb3304",
        github: "https://github.com/AsmeetKaurMakkad"
    },
    {
        name: "Phani Kotha",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1DnW5wdbWIMAjwbSbeDAWb8ZZDUMXwSJP",
        linkedin: "https://www.linkedin.com/in/phani",
        github: "https://github.com/phanikotha18-sudo"
    },
    {
        name: "Manya Sahasra",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1jroorPy__oC4jRtS7EoK6nAxrRY5xpEt",
        linkedin: "https://www.linkedin.com/in/manya2929",
        github: "https://github.com/ManyaSaaha9"
    },
    {
        name: "Pragati Tiwari",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1G7i8nxddC1TO50m6carSwvoKgkELeO2M",
        linkedin: "https://linkedin.com/in/pragati-tiwari-608b043b5",
        github: "https://github.com/pTIWARI-20"
    },
    {
        name: "Asna Abdul Kareem",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1eG-gSwzDJLttym0NSMvG9buItwhBt2WB",
        linkedin: "https://in.linkedin.com/in/asna-abdul-kareem-6774a6292",
        github: "https://github.com/Asnaabdul"
    },
    {
        name: "Ganesh Goud Tekmul",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1Leq-efX_T_Q4Z-c5vLZzrZ2SVCioKFNH",
        linkedin: "https://www.linkedin.com/in/ganesh-goud-a55a8b373/",
        github: "https://github.com/ganeshgoud96"
    },
    {
        name: "Praneetha Baru",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1Rxin3LyOIBYiANH02dBS0DxTDBXr1feI",
        linkedin: "https://www.linkedin.com/in/praneetha-baru-0846b0295",
        github: "https://github.com/Praneetha7305"
    },
    {
        name: "Sowjanya N",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1hQ4DWiurWnMJ-w-KroOiwnQaiZouFCEW",
        linkedin: "https://www.linkedin.com/in/sowjanya-n-962319354",
        github: "https://github.com/Sowji0118/"
    },
    {
        name: "Shaik Eshak",
        role: "AI Engineer",
        image: "https://drive.google.com/uc?export=view&id=1-VxqotzSoXqu9xo7Mn8FvsOn52lcxlS-",
        linkedin: "https://www.linkedin.com/in/eshak-s-16738626a/",
        github: "https://github.com/Eshakshai"
    }
];

export default function TeamSection() {
    return (
        <section className="py-24 bg-gray-50/50 border-t border-gray-100">
            <div className="max-w-[1100px] mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                        Meet the Team Behind helpdesk.ai
                    </h2>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                        Built by engineers focused on intelligent support automation.
                    </p>
                </div>

                {/* Responsive Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {TEAM_MEMBERS.map((member, index) => (
                        <div
                            key={index}
                            className="group relative bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col items-center text-center"
                        >
                            {/* Image Container with Hover Overlay */}
                            <div className="relative w-32 h-32 mb-5 rounded-full overflow-hidden border-4 border-white shadow-md">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />

                                {/* Emerald Overlay on Hover */}
                                <div className="absolute inset-0 bg-emerald-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                                    {member.github && (
                                        <a
                                            href={member.github}
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
                                            href={member.linkedin}
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
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                                <p className="text-sm font-medium text-emerald-600 uppercase tracking-widest">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import parse, { domToReact } from "html-react-parser";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

const Badges = [
  {
    name: "css",
    aliases: ["css3", "styling"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740912214/w3_css-icon_old_cllr3z.svg",
  },
  {
    name: "image",
    aliases: ["Base64", "image testing"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740911931/picture-photo-svgrepo-com_lmkvwi.svg",
  },
  {
    name: "react.js",
    aliases: ["reactjs", "react"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738191/react-2_c6jrrj.svg",
  },
  {
    name: "node.js",
    aliases: ["nodejs", "node"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738192/nodejs-icon_z8mjxz.svg",
  },
  {
    name: "javascript",
    aliases: ["js"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738190/logo-javascript_jxymx6.svg",
  },
  {
    name: "python",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738250/python-icon_ihlzuk.svg",
  },
  {
    name: "java",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738362/java-icon_adjtgl.svg",
  },
  {
    name: "c++",
    aliases: ["cpp"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738190/c_ojh7bw.svg",
  },
  {
    name: "html",
    aliases: ["html5"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738191/html-1_xz62kl.svg",
  },
  {
    name: "angular",
    aliases: ["angularjs"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738190/angular-icon-1_aiwgpq.svg",
  },
  {
    name: "digitalocean",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738191/digitalocean-icon_u3tnrl.svg",
  },
  {
    name: "aws",
    aliases: ["amazon web services"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738913/icons8-aws_llolqc.svg",
  },
  {
    name: "next.js",
    aliases: ["nextjs"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728739011/nextjs-icon_cbafxp.svg",
  },
  {
    name: "typescript",
    aliases: ["ts"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250169/typescript-icon-svgrepo-com_bfafaw.svg",
  },
  {
    name: "go",
    aliases: ["golang"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250169/go-svgrepo-com_r3sgdm.svg",
  },
  {
    name: "ruby",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250168/ruby-svgrepo-com_kmqkbz.svg",
  },
  {
    name: "swift",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250168/swift-svgrepo-com_sivm0e.svg",
  },
  {
    name: "kotlin",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250168/kotlin-svgrepo-com_xo0s9k.svg",
  },
  {
    name: "rust",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250168/rust-svgrepo-com_h3tubm.svg",
  },
  {
    name: "php",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250167/php-svgrepo-com_s3om4c.svg",
  },
  {
    name: "c#",
    aliases: ["csharp"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250165/c--4_tkfunq.svg",
  },
  {
    name: "r",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250164/r-lang-svgrepo-com_fif9ng.svg",
  },
  {
    name: "vue.js",
    aliases: ["vuejs", "vue"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250162/vue-js-svgrepo-com_mqhp8l.svg",
  },
  {
    name: "svelte",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250162/svelte-icon-svgrepo-com_kxmjly.svg",
  },
  {
    name: "bootstrap",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250167/bootstrap-svgrepo-com_t8zqrl.svg",
  },
  {
    name: "tailwind css",
    aliases: ["tailwindcss", "tailwind"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250166/tailwind-svgrepo-com_rslfdz.svg",
  },
  {
    name: "express.js",
    aliases: ["expressjs", "express"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250166/express-svgrepo-com_juzt7u.svg",
  },
  {
    name: "django",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250166/django-svgrepo-com_uwpint.svg",
  },
  {
    name: "laravel",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250166/laravel-svgrepo-com_ael0jl.svg",
  },
  {
    name: "mysql",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250165/mysql-logo-svgrepo-com_x0nodu.svg",
  },
  {
    name: "postgresql",
    aliases: ["postgres"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250164/postgresql-svgrepo-com_g2tlss.svg",
  },
  {
    name: "mongodb",
    aliases: ["mongo"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250164/mongodb-svgrepo-com_rnft5p.svg",
  },
  {
    name: "docker",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250163/docker-svgrepo-com_ccoqmc.svg",
  },
  {
    name: "kubernetes",
    aliases: ["k8s"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250163/kubernetes-svgrepo-com_munrul.svg",
  },
  {
    name: "pandas",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250163/pandas-svgrepo-com_rd0owi.svg",
  },
  {
    name: "flutter",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250163/flutter-svgrepo-com_r2emx4.svg",
  },
  {
    name: "react native",
    aliases: ["reactnative"],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/preact-svgrepo-com_kycciw.svg",
  },
  {
    name: "git",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/git-svgrepo-com_mqap7j.svg",
  },
  {
    name: "nginx",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/nginx-logo-svgrepo-com_dv5ev4.svg",
  },
  {
    name: "figma",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/figma-svgrepo-com_wqdiou.svg",
  },
  {
    name: "linux",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/linux-svgrepo-com_xevtrj.svg",
  },
  {
    name: "Gitlab",
    aliases: [],
    logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/gitlab-svgrepo-com_ok9wjq.svg",
  },
];

// const CodeBlock = ({ codeString, language }) => {
//   return (
//     <SyntaxHighlighter language={language} style={dracula}>
//       {codeString}
//     </SyntaxHighlighter>
//   );
// };

const options = {
  replace: ({ name, children, attribs }) => {
    if (name === "code") {
      const codeString = domToReact(children);
      const language = "javascript"; // Default language
      // return <CodeBlock codeString={codeString} language={language} />;
      return "CodeBlock";
    }
    if (name === "ul") {
      return <ul className="list-disc pl-5">{domToReact(children)}</ul>;
    }
    if (name === "ol") {
      return <ol className="list-decimal pl-5">{domToReact(children)}</ol>;
    }
    if (name === "li") {
      return <li>{domToReact(children)}</li>;
    }
    if (name === "blockquote") {
      return (
        <blockquote className="border-l-4 border-slate-400 pl-4 italic text-slate-300">
          {domToReact(children)}
        </blockquote>
      );
    }
    if (name === "img" && attribs?.src) {
      return (
        <img
          src={attribs.src || "/placeholder.svg"}
          alt={attribs.alt || "Image"}
          className="max-w-full h-auto"
        />
      );
    }
    if (name === "a" && attribs?.href) {
      return (
        <a
          href={attribs.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {domToReact(children)}
        </a>
      );
    }
  },
};

export function QuesList({ onQuesSelect, searchInput }) {
  const questions = useSelector((store) => store.questions.questions);
  const loading = useSelector((store) => store.questions.loading);
  const [expandedTags, setExpandedTags] = useState({});
  const [filteredQuestions, setFilteredQuestions] = useState(questions);
  const [selectedQuesId, setSelectedQuesId] = useState(null); // Track selected question ID
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (searchInput) {
      const lowercasedInput = searchInput.toLowerCase();
      const filtered = questions.filter(
        (ques) =>
          ques.title.toLowerCase().includes(lowercasedInput) ||
          ques.user.name.toLowerCase().includes(lowercasedInput)
      );
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(questions);
    }
  }, [searchInput, questions]);

  const formatCreatedAt = (createdAt) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  };

  const toggleShowMore = (id) => {
    setExpandedTags((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getBadgeLogo = (tag) => {
    const normalizedTag = tag.trim().toLowerCase();
    const badge = Badges.find(
      (badge) =>
        badge.name.toLowerCase() === normalizedTag ||
        badge.aliases.some((alias) => alias.toLowerCase() === normalizedTag)
    );
    return badge
      ? badge.logo
      : "https://res.cloudinary.com/vanshstorage/image/upload/v1729884943/download_m2eu84.png";
  };

  const handleQuesClick = (id) => {
    setSelectedQuesId(id); // Set the selected question ID
    onQuesSelect(id); // Call the parent handler
  };

  // Function to truncate content to one line
  const truncateContent = (content) => {
    const maxLength = 50; // Adjust this value based on your design
    if (content.length > maxLength) {
      return content.slice(0, maxLength) + "...";
    }
    return content;
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] overflow-hidden">
      <ScrollArea className="h-full">
        {!loading ? (
          filteredQuestions.length > 0 ? (
            <div className="flex flex-col gap-2 p-4 pt-0">
              {filteredQuestions.map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent w-full",
                    selectedQuesId === item.id && "bg-accent"
                  )}
                  onClick={() => handleQuesClick(item.id)}
                >
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex w-full font-bold justify-between items-center">
                        <div className="flex gap-3 items-center">
                          <div className="text-[15px]">{item.title}</div>{" "}
                          {/* Show title here */}
                        </div>
                        <div className="text-xs text-muted-foreground font-bold">
                          {formatCreatedAt(item.createdAt)}
                        </div>
                      </div>
                    </div>
                    {/* Truncated content */}
                    <div className="text-sm text-muted-foreground">
                      {parse(truncateContent(item.content), options)}
                    </div>
                  </div>
                  <div className="mt-2 w-full">
                    <div className="flex flex-wrap gap-2">
                      {(expandedTags[item.id]
                        ? item.tags
                        : item.tags.slice(0, 5)
                      ).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1 px-2 py-1 text-xs"
                        >
                          <img
                            src={getBadgeLogo(tag)}
                            alt={`${tag} logo`}
                            className="w-3 h-3"
                          />
                          <span>{tag}</span>
                        </Badge>
                      ))}
                      <div className="flex items-center justify-end gap-3 w-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={item.user.picture}
                            alt={`Profile picture of ${item.user.name}`}
                          />
                          <AvatarFallback>
                            {item.user.name[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-semibold text-sm">
                          {item.user.name}
                        </div>{" "}
                        {/* Show user's name here */}
                      </div>
                      {item.tags.length > 5 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShowMore(item.id);
                          }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expandedTags[item.id] ? (
                            <span>Show Less</span>
                          ) : (
                            <>
                              <span>{item.tags.length - 5} more</span>
                              <ChevronRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <span className="text-muted-foreground">No questions found</span>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-4 p-4 pt-0">
            {[...Array(5)].map((_, index) => (
              <Skeleton
                key={index}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent"
                )}
              >
                <Skeleton className="flex w-full flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex w-full font-bold justify-between items-center">
                      <div className="flex gap-3">
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </Skeleton>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton
                      key={index}
                      className="flex w-20 items-center gap-1 px-2 py-1"
                    >
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="w-12 h-4" />
                    </Skeleton>
                  ))}
                </div>
              </Skeleton>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

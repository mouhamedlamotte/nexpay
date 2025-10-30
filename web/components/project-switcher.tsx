"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Building2, Plus, Cog } from "lucide-react";
import Link from "next/link";
import { useProjectStore } from "@/stores/project.store";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { Project } from "@/lib/types";
import { useAppStore } from "@/stores/app.store";

export function ProjectSwitcher() {
  const { currentProject, setCurrentProject } =
    useProjectStore();
    const {setLoading, setLoadingPhase} = useAppStore();

  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.getAll({ limit: 10 }),
  })

  const projects = data?.data || [];

  const handleProjectChange = (project: Project) => {
      setLoadingPhase('PROJECT');
      setLoading(true);
      setCurrentProject(project);
      window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-2 justify-start gap-2 max-w-[280px]  focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex-1 min-w-0 text-left">
              <div className="font-medium text-sm truncate">
                {currentProject?.name}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[320px]">
        <div className="flex items-center justify-between">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Projects
        </DropdownMenuLabel>
        <Link href="/projects">
            <Button variant="ghost" className="hover:bg-secondary">
              <Cog className="h-4 w-4" />
              Gerer
            </Button>
          </Link>

        </div>
        <DropdownMenuSeparator />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => handleProjectChange(project)}
            className="flex items-center gap-3 p-3 cursor-pointer"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground truncate">
                {project.name}
              </div>
            </div>
            {project.id === currentProject?.id && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

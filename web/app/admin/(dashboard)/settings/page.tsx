"use client";

import React from "react";
import { useAuthStore } from "../stores/auth/auth-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);


  return (
      <Card>
        <CardHeader>
          <CardTitle>Profil utilisateur</CardTitle>
          <CardDescription>Informations de votre compte</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nom complet</p>
            <p className="text-base font-medium">
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-base font-medium">{user?.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Statut</p>
            <Badge variant={user?.isActive ? "default" : "secondary"}>
              {user?.isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground border-t pt-4">
            <p>Créé le : {new Date(user?.createdAt || "").toLocaleString()}</p>
            <p>Dernière mise à jour : {new Date(user?.updatedAt || "").toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
  );
};

export default ProfilePage;

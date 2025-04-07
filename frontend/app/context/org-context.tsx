"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";

interface OrganizationContextType {
  organizationName: string;
  organizationId: string;
  setOrganization: (name: string, id: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const OrganizationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("Loading...");
  const [organizationId, setOrganizationId] = useState("");

  useEffect(() => {
    const fetchOrgInfo = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/user/get-user-org/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrganizationName(data.name);
          setOrganizationId(data.id);
        } else {
          setOrganizationName("Unknown Organization");
        }
      } catch {
        setOrganizationName("Error Loading Org");
      }
    };

    fetchOrgInfo();
  }, [user?.id]);

  const setOrganization = (name: string, id: string) => {
    setOrganizationName(name);
    setOrganizationId(id);
  };

  return (
    <OrganizationContext.Provider
      value={{ organizationName, organizationId, setOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};

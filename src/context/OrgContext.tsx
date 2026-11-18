"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Organization } from "@/lib/types";

interface OrgContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  isLoading: boolean;
  setCurrentOrgId: (id: string) => void;
  refreshOrgs: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType>({
  organizations: [],
  currentOrg: null,
  isLoading: true,
  setCurrentOrgId: () => {},
  refreshOrgs: async () => {},
});

export const useOrg = () => useContext(OrgContext);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgIdState] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshOrgs = useCallback(async () => {
    try {
      const res = await fetch("/api/organizations");
      if (res.ok) {
        const data: Organization[] = await res.json();
        setOrganizations(data);

        // If current org is not set or not in list, pick stored or default or first
        const savedOrgId = typeof window !== "undefined" ? localStorage.getItem("erp_active_org_id") : null;
        const exists = data.some((o) => o.id === savedOrgId);

        if (savedOrgId && exists) {
          setCurrentOrgIdState(savedOrgId);
        } else if (data.length > 0) {
          const defaultOrg = data.find((o) => o.isDefault) || data[0];
          setCurrentOrgIdState(defaultOrg.id);
          if (typeof window !== "undefined") {
            localStorage.setItem("erp_active_org_id", defaultOrg.id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load organizations:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrgs();
  }, [refreshOrgs]);

  const setCurrentOrgId = (id: string) => {
    setCurrentOrgIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("erp_active_org_id", id);
    }
  };

  const currentOrg = organizations.find((o) => o.id === currentOrgId) || organizations[0] || null;

  return (
    <OrgContext.Provider
      value={{
        organizations,
        currentOrg,
        isLoading,
        setCurrentOrgId,
        refreshOrgs,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

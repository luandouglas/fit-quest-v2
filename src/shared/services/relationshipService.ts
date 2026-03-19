import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore/lite";

import { authService } from "@/shared/services/authService";
import { getFirebaseFirestore } from "@/shared/services/firebase";
import type {
  LinkedProfessional,
  RelationshipInvite,
  StudentRelationshipsOverview,
} from "@/shared/services/contracts/relationship";

type InviteDocument = {
  id: string;
  studentId: string;
  professionalId: string;
  professionalRole: "PERSONAL" | "NUTRITIONIST";
  professionalName: string;
  professionalCode: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt?: string;
};

type PersonalInviteDocument = {
  code: string;
  personalId: string;
  personalName: string;
  personalRole: string;
  createdAt: string;
  status: string;
};

function getDb() {
  const db = getFirebaseFirestore();
  if (!db) {
    throw new Error("Firebase is not configured for relationship data.");
  }
  return db;
}

function resolveStudentId() {
  const session = authService.getStoredSession();
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Authenticated student session is required.");
  }
  return session.user.id;
}

async function buildRelationshipsOverview(
  studentId: string,
): Promise<StudentRelationshipsOverview> {
  const db = getDb();
  const invitesSnapshot = await getDocs(
    query(
      collection(db, "relationshipInvites"),
      where("studentId", "==", studentId),
    ),
  );

  const invites = invitesSnapshot.docs.map(
    (entry) => entry.data() as InviteDocument,
  );
  const pendingInvites: RelationshipInvite[] = invites
    .filter((invite) => invite.status === "pending")
    .map((invite) => ({
      id: invite.id,
      studentId: invite.studentId,
      professionalId: invite.professionalId,
      professionalRole: invite.professionalRole,
      professionalName: invite.professionalName,
      professionalCode: invite.professionalCode,
      status: invite.status,
      createdAt: invite.createdAt,
      respondedAt: invite.respondedAt,
    }));

  const recentInvites: RelationshipInvite[] = invites
    .filter((invite) => invite.status !== "pending")
    .slice(0, 5)
    .map((invite) => ({
      id: invite.id,
      studentId: invite.studentId,
      professionalId: invite.professionalId,
      professionalRole: invite.professionalRole,
      professionalName: invite.professionalName,
      professionalCode: invite.professionalCode,
      status: invite.status,
      createdAt: invite.createdAt,
      respondedAt: invite.respondedAt,
    }));

  const acceptedPersonal = invites.find(
    (invite) =>
      invite.professionalRole === "PERSONAL" && invite.status === "accepted",
  );
  const acceptedNutritionist = invites.find(
    (invite) =>
      invite.professionalRole === "NUTRITIONIST" &&
      invite.status === "accepted",
  );

  const personal: LinkedProfessional | null = acceptedPersonal
    ? {
        id: acceptedPersonal.professionalId,
        role: "PERSONAL",
        name: acceptedPersonal.professionalName,
        code: acceptedPersonal.professionalCode,
        linkedAt: acceptedPersonal.respondedAt ?? acceptedPersonal.createdAt,
      }
    : null;

  const nutritionist: LinkedProfessional | null = acceptedNutritionist
    ? {
        id: acceptedNutritionist.professionalId,
        role: "NUTRITIONIST",
        name: acceptedNutritionist.professionalName,
        code: acceptedNutritionist.professionalCode,
        linkedAt:
          acceptedNutritionist.respondedAt ?? acceptedNutritionist.createdAt,
      }
    : null;

  return {
    studentId,
    personal,
    nutritionist,
    pendingInvites,
    recentInvites,
  };
}

export const relationshipService = {
  async getMyRelationships(): Promise<StudentRelationshipsOverview> {
    const studentId = resolveStudentId();
    return buildRelationshipsOverview(studentId);
  },
  async inviteByCodeOrId(params: {
    codeOrId: string;
  }): Promise<StudentRelationshipsOverview> {
    const studentId = resolveStudentId();
    const db = getDb();
    const code = params.codeOrId.trim().toUpperCase();

    const inviteDocSnapshot = await getDoc(doc(db, "personalInvites", code));

    if (!inviteDocSnapshot.exists()) {
      throw new Error(
        "Codigo de convite nao encontrado. Verifique e tente novamente.",
      );
    }

    const inviteData = inviteDocSnapshot.data() as PersonalInviteDocument;

    const existingInvites = await getDocs(
      query(
        collection(db, "relationshipInvites"),
        where("studentId", "==", studentId),
        where("professionalId", "==", inviteData.personalId),
      ),
    );

    const alreadyAccepted = existingInvites.docs.some(
      (entry) => (entry.data() as InviteDocument).status === "accepted",
    );
    if (alreadyAccepted) {
      throw new Error("Voce ja esta vinculado a esse profissional.");
    }

    const alreadyPending = existingInvites.docs.some(
      (entry) => (entry.data() as InviteDocument).status === "pending",
    );
    if (alreadyPending) {
      throw new Error("Ja existe um convite pendente com esse profissional.");
    }

    const inviteId = crypto.randomUUID();
    const newInvite: InviteDocument = {
      id: inviteId,
      studentId,
      professionalId: inviteData.personalId,
      professionalRole: "PERSONAL",
      professionalName: inviteData.personalName,
      professionalCode: code,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "relationshipInvites", inviteId), newInvite);
    return buildRelationshipsOverview(studentId);
  },
  async acceptInviteByCodeOrId(params: {
    codeOrId: string;
  }): Promise<StudentRelationshipsOverview> {
    const studentId = resolveStudentId();
    const db = getDb();
    const code = params.codeOrId.trim().toUpperCase();

    const inviteDocSnapshot = await getDoc(doc(db, "personalInvites", code));

    if (!inviteDocSnapshot.exists()) {
      throw new Error(
        "Codigo de convite nao encontrado. Verifique e tente novamente.",
      );
    }

    const inviteData = inviteDocSnapshot.data() as PersonalInviteDocument;

    const existingInvites = await getDocs(
      query(
        collection(db, "relationshipInvites"),
        where("studentId", "==", studentId),
        where("professionalId", "==", inviteData.personalId),
      ),
    );

    const acceptedInvite = existingInvites.docs.find(
      (entry) => (entry.data() as InviteDocument).status === "accepted",
    );

    if (acceptedInvite) {
      return buildRelationshipsOverview(studentId);
    }

    const inviteId = crypto.randomUUID();
    const now = new Date().toISOString();

    await setDoc(doc(db, "relationshipInvites", inviteId), {
      id: inviteId,
      studentId,
      professionalId: inviteData.personalId,
      professionalRole: "PERSONAL",
      professionalName: inviteData.personalName,
      professionalCode: code,
      status: "accepted",
      createdAt: now,
      respondedAt: now,
    } satisfies InviteDocument);

    await setDoc(
      doc(db, "students", studentId, "profile", "onboarding"),
      {
        anamnesisStatus: "pending",
        onboardingSource: "invite",
        requiresPasswordReset: false,
        linkedPersonalId: inviteData.personalId,
        linkedPersonalName: inviteData.personalName,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

    return buildRelationshipsOverview(studentId);
  },
  async respondToInvite(params: {
    inviteId: string;
    action: "accept" | "reject";
  }): Promise<StudentRelationshipsOverview> {
    const studentId = resolveStudentId();
    const db = getDb();
    const reference = doc(db, "relationshipInvites", params.inviteId);
    const snapshot = await getDoc(reference);

    if (!snapshot.exists()) {
      throw new Error("Convite nao encontrado.");
    }

    const invite = snapshot.data() as InviteDocument;

    if (invite.studentId !== studentId) {
      throw new Error("Voce nao tem permissao para responder esse convite.");
    }

    if (invite.status !== "pending") {
      throw new Error("Esse convite ja foi respondido anteriormente.");
    }

    await setDoc(
      reference,
      {
        status: params.action === "accept" ? "accepted" : "rejected",
        respondedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return buildRelationshipsOverview(studentId);
  },
};

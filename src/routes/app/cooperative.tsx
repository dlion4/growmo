/* ============================================================================
   PAGE 22 — COOPERATIVE MANAGEMENT (/app/cooperative)
   Registration, members, pooled buying, sales, finance, contracts and updates.
   ========================================================================== */
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  HandCoins,
  Landmark,
  Leaf,
  MailCheck,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  Phone,
  Plus,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Tractor,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CooperativeModalHub,
  type CooperativeModalId,
} from "../../components/app/CooperativeModals";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  BULK_INPUT_LINES,
  COLLECTIVE_SALE,
  COMMUNICATIONS,
  COOP_ACCOUNTS,
  COOP_CONTEXT,
  COOP_CONTRACTS,
  COOPERATIVE_MEMBERS,
  COOPERATIVE_PROFILE,
  type CoopContract,
  type CooperativeMember,
  CROP_DASHBOARD,
  contractTone,
  FINANCIAL_REPORTS,
  INPUT_WORKFLOW,
  type InputLine,
  memberTone,
  SALE_CONTRIBUTIONS,
  type SaleContribution,
} from "../../data/app/cooperative";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/cooperative")({
  component: CooperativeManagementPage,
});

type View =
  | "overview"
  | "members"
  | "inputs"
  | "marketing"
  | "finance"
  | "contracts"
  | "comms";
type DrawerId = "profile" | "member" | "contract" | "input" | "account" | null;
type FinanceTab = "accounts" | "reports";

function CooperativeManagementPage() {
  const toast = useToast();
  const [view, setView] = useState<View>("overview");
  const [financeTab, setFinanceTab] = useState<FinanceTab>("accounts");
  const [members, setMembers] = useState(COOPERATIVE_MEMBERS);
  const [sales, setSales] = useState(SALE_CONTRIBUTIONS);
  const [comms, setComms] = useState(COMMUNICATIONS);
  const [modal, setModal] = useState<CooperativeModalId>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [selectedMember, setSelectedMember] =
    useState<CooperativeMember | null>(COOPERATIVE_MEMBERS[0]);
  const [selectedContract, setSelectedContract] = useState<CoopContract | null>(
    COOP_CONTRACTS[0],
  );
  const [selectedInput, setSelectedInput] = useState<InputLine | null>(
    BULK_INPUT_LINES[0],
  );
  const [selectedAccount, setSelectedAccount] = useState(COOP_ACCOUNTS[0]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberStatus, setMemberStatus] = useState<
    "All" | CooperativeMember["status"]
  >("All");
  const [memberPage, setMemberPage] = useState(1);
  const [saleSearch, setSaleSearch] = useState("");
  const [salePage, setSalePage] = useState(1);
  const [contractStatus, setContractStatus] = useState<
    "All" | CoopContract["status"]
  >("All");
  const [contractPage, setContractPage] = useState(1);
  const [commSearch, setCommSearch] = useState("");
  const [commPage, setCommPage] = useState(1);
  const [memberMenu, setMemberMenu] = useState<string | null>(null);

  const filteredMembers = useMemo(
    () =>
      members.filter((member) => {
        const matches =
          `${member.name} ${member.phone} ${member.farm} ${member.crops} ${member.ward}`
            .toLowerCase()
            .includes(memberSearch.toLowerCase());
        return (
          matches && (memberStatus === "All" || member.status === memberStatus)
        );
      }),
    [members, memberSearch, memberStatus],
  );
  const memberPages = Math.max(1, Math.ceil(filteredMembers.length / 5));
  const shownMembers = filteredMembers.slice(
    (memberPage - 1) * 5,
    memberPage * 5,
  );

  const filteredSales = useMemo(
    () =>
      sales.filter((sale) =>
        `${sale.member} ${sale.id} ${sale.payment}`
          .toLowerCase()
          .includes(saleSearch.toLowerCase()),
      ),
    [sales, saleSearch],
  );
  const salePages = Math.max(1, Math.ceil(filteredSales.length / 5));
  const shownSales = filteredSales.slice((salePage - 1) * 5, salePage * 5);

  const filteredContracts = useMemo(
    () =>
      COOP_CONTRACTS.filter(
        (contract) =>
          contractStatus === "All" || contract.status === contractStatus,
      ),
    [contractStatus],
  );
  const contractPages = Math.max(1, Math.ceil(filteredContracts.length / 4));
  const shownContracts = filteredContracts.slice(
    (contractPage - 1) * 4,
    contractPage * 4,
  );

  const filteredComms = useMemo(
    () =>
      comms.filter((entry) =>
        `${entry.channel} ${entry.audience} ${entry.message} ${entry.status}`
          .toLowerCase()
          .includes(commSearch.toLowerCase()),
      ),
    [comms, commSearch],
  );
  const commPages = Math.max(1, Math.ceil(filteredComms.length / 5));
  const shownComms = filteredComms.slice((commPage - 1) * 5, commPage * 5);

  const openMember = (member: CooperativeMember, next: DrawerId = "member") => {
    setSelectedMember(member);
    setDrawer(next);
  };
  const openInput = (line: InputLine) => {
    setSelectedInput(line);
    setDrawer("input");
  };
  const openContract = (contract: CoopContract) => {
    setSelectedContract(contract);
    setDrawer("contract");
  };

  const savedWorkflow = (message: string) => {
    if (modal === "add-member") {
      setMembers((items) => [
        ...items,
        {
          id: `MBR-${String(items.length + 1).padStart(3, "0")}`,
          name: "New Githunguri Member",
          idNumber: "11223344",
          phone: "0710 555 909",
          farm: "Member Farm",
          acreage: 1,
          crops: "Cabbage",
          shares: 20,
          status: "Pending",
          joined: "Jan 2027",
          ward: "Githunguri",
          balance: 0,
        },
      ]);
    }
    if (modal === "suspend-member" && selectedMember) {
      setMembers((items) =>
        items.map((member) =>
          member.id === selectedMember.id
            ? {
                ...member,
                status: member.status === "Suspended" ? "Active" : "Suspended",
              }
            : member,
        ),
      );
    }
    if (modal === "pay-member-payout" && selectedMember) {
      setSales((items) =>
        items.map((sale) =>
          sale.member === selectedMember.name
            ? { ...sale, payment: "Paid", receipt: "QLJ8N5CO" }
            : sale,
        ),
      );
    }
    if (
      [
        "broadcast-sms",
        "whatsapp-update",
        "push-update",
        "individual-sms",
        "delivery-notice",
        "collection-notice",
      ].includes(modal ?? "")
    ) {
      const channel =
        modal === "whatsapp-update"
          ? "WhatsApp group"
          : modal === "push-update"
            ? "Push notification"
            : modal === "individual-sms"
              ? "Individual SMS"
              : "Broadcast SMS";
      setComms((items) => [
        {
          id: `COM-${String(items.length + 1).padStart(3, "0")}`,
          channel,
          audience:
            modal === "individual-sms" && selectedMember
              ? selectedMember.name
              : "Selected cooperative members",
          message:
            "GrowMO cooperative update recorded and ready for member action.",
          status: "Sent",
          at: "Just now",
        },
        ...items,
      ]);
    }
    toast(message, "success");
  };

  const memberTotal = Math.max(45, members.length + 35);
  const activeMembers =
    members.filter((member) => member.status === "Active").length + 35;

  return (
    <div>
      <header className="gm-card gm-plan-head">
        <div className="d-flex flex-wrap align-items-start gap-4">
          <div style={{ flex: "1 1 440px" }}>
            <span className="gm-eyebrow on-dark">
              <span className="dot" /> Page 22 · Githunguri, Kiambu
            </span>
            <h1 className="font-display mt-2">
              One cooperative record, stronger buying and fairer sales
            </h1>
            <p className="gm-lead on-dark mb-0">
              Delion Farmers Cooperative Society Ltd brings 45 growers, pooled
              acreage and buyer-ready harvests into one accountable workspace.
              Pamoja tunauza zaidi.
            </p>
          </div>
          <div className="gm-plan-hero-actions">
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => setModal("add-member")}
            >
              <Plus /> Add member
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-ghost"
              onClick={() => setModal("broadcast-sms")}
            >
              <MessageCircle /> Send update
            </button>
          </div>
        </div>
        <div className="gm-plan-kpi-row mt-4">
          {[
            {
              icon: UsersRound,
              value: `${memberTotal}`,
              label: "registered members",
              note: `${activeMembers} active · 2 pending`,
            },
            {
              icon: Tractor,
              value: "120 acres",
              label: "collective farm base",
              note: "Five high-value crop groups",
            },
            {
              icon: ShoppingBasket,
              value: kes(COOP_CONTEXT.savings),
              label: "bulk-input saving",
              note: "Current buying round",
            },
            {
              icon: Banknote,
              value: kes(COOP_CONTEXT.pendingPayout),
              label: "payouts to release",
              note: "After quality checks",
            },
          ].map((metric) => (
            <div
              className="gm-plan-facts"
              key={metric.label}
              style={{ minWidth: 158 }}
            >
              <span>
                <metric.icon />
                <small>{metric.label}</small>
                <strong className="font-display" style={{ fontSize: "1.1rem" }}>
                  {metric.value}
                </strong>
                <small>{metric.note}</small>
              </span>
            </div>
          ))}
        </div>
      </header>

      <PlannerSubtabs
        value={view}
        label="Cooperative workspace"
        onChange={setView}
        items={[
          { id: "overview", label: "Cooperative", icon: <Building2 /> },
          {
            id: "members",
            label: "Members",
            icon: <UsersRound />,
            count: memberTotal,
          },
          {
            id: "inputs",
            label: "Collective buying",
            icon: <ShoppingBasket />,
            count: 5,
          },
          {
            id: "marketing",
            label: "Marketing & sales",
            icon: <Sprout />,
            count: 10,
          },
          { id: "finance", label: "Finance", icon: <WalletCards />, count: 5 },
          { id: "contracts", label: "Contracts", icon: <FileText />, count: 6 },
          {
            id: "comms",
            label: "Member updates",
            icon: <MessageCircle />,
            count: 3,
          },
        ]}
      />

      {view === "overview" ? (
        <OverviewContent
          onProfile={() => setDrawer("profile")}
          onModal={setModal}
        />
      ) : null}
      {view === "members" ? (
        <MembersContent
          members={shownMembers}
          search={memberSearch}
          status={memberStatus}
          page={memberPage}
          pages={memberPages}
          total={filteredMembers.length}
          menu={memberMenu}
          onSearch={(value) => {
            setMemberSearch(value);
            setMemberPage(1);
          }}
          onStatus={(value) => {
            setMemberStatus(value);
            setMemberPage(1);
          }}
          onPage={setMemberPage}
          onOpen={openMember}
          onMenu={setMemberMenu}
          onModal={setModal}
        />
      ) : null}
      {view === "inputs" ? (
        <InputsContent onOpen={openInput} onModal={setModal} />
      ) : null}
      {view === "marketing" ? (
        <MarketingContent
          sales={shownSales}
          search={saleSearch}
          page={salePage}
          pages={salePages}
          total={filteredSales.length}
          onSearch={(value) => {
            setSaleSearch(value);
            setSalePage(1);
          }}
          onPage={setSalePage}
          onMember={(name) => {
            const member = members.find((item) => item.name === name);
            if (member) openMember(member);
          }}
          onModal={setModal}
        />
      ) : null}
      {view === "finance" ? (
        <FinanceContent
          tab={financeTab}
          onTab={setFinanceTab}
          onAccount={(id) => {
            const account = COOP_ACCOUNTS.find((item) => item.id === id);
            if (account) {
              setSelectedAccount(account);
              setDrawer("account");
            }
          }}
          onModal={setModal}
        />
      ) : null}
      {view === "contracts" ? (
        <ContractsContent
          contracts={shownContracts}
          status={contractStatus}
          page={contractPage}
          pages={contractPages}
          total={filteredContracts.length}
          onStatus={(value) => {
            setContractStatus(value);
            setContractPage(1);
          }}
          onPage={setContractPage}
          onOpen={openContract}
          onModal={setModal}
        />
      ) : null}
      {view === "comms" ? (
        <CommunicationsContent
          entries={shownComms}
          search={commSearch}
          page={commPage}
          pages={commPages}
          total={filteredComms.length}
          onSearch={(value) => {
            setCommSearch(value);
            setCommPage(1);
          }}
          onPage={setCommPage}
          onModal={setModal}
        />
      ) : null}

      <CooperativeDrawer
        drawer={drawer}
        member={selectedMember}
        contract={selectedContract}
        input={selectedInput}
        account={selectedAccount}
        onClose={() => setDrawer(null)}
        onModal={setModal}
      />
      <CooperativeModalHub
        active={modal}
        member={selectedMember}
        contract={selectedContract}
        inputLine={selectedInput}
        onClose={() => setModal(null)}
        onSaved={savedWorkflow}
      />
    </div>
  );
}

function OverviewContent({
  onProfile,
  onModal,
}: {
  onProfile: () => void;
  onModal: (id: CooperativeModalId) => void;
}) {
  return (
    <div className="mt-4">
      <div className="row g-3">
        <div className="col-lg-7">
          <Reveal>
            <section className="gm-card h-100">
              <DashboardSectionHeader
                eyebrow="Registered cooperative"
                title={COOPERATIVE_PROFILE.name}
                subtitle={`${COOPERATIVE_PROFILE.type} · ${COOPERATIVE_PROFILE.county} County`}
                action={
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={onProfile}
                  >
                    <EyeIcon /> Open record
                  </button>
                }
              />
              <div className="row g-3 mt-1">
                <ProfileFact
                  icon={BadgeCheck}
                  label="Registration"
                  value={COOPERATIVE_PROFILE.registration}
                  note={`Registered ${COOPERATIVE_PROFILE.registeredOn}`}
                />
                <ProfileFact
                  icon={MapPin}
                  label="Collection centre"
                  value="Githunguri Town"
                  note="Next to Chief's camp"
                />
                <ProfileFact
                  icon={Landmark}
                  label="Bank account"
                  value="KCB Githunguri"
                  note="Two signatories required"
                />
                <ProfileFact
                  icon={Phone}
                  label="M-Pesa Paybill"
                  value={COOPERATIVE_PROFILE.paybill}
                  note="Member collection payments"
                />
              </div>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("verify-registration")}
                >
                  <ShieldCheck /> Verify registration
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("manage-signatories")}
                >
                  <UsersRound /> 3 signatories
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("constitution")}
                >
                  <FileText /> Constitution
                </button>
              </div>
            </section>
          </Reveal>
        </div>
        <div className="col-lg-5">
          <Reveal delay={0.08}>
            <section className="gm-card h-100">
              <DashboardSectionHeader
                eyebrow="Board desk"
                title="This week"
                subtitle="Priority cooperative actions"
              />
              <div className="gm-check-list">
                <ActionRow
                  icon={ShoppingBasket}
                  title="Approve bulk input order"
                  note={`${kes(COOP_CONTEXT.savings)} member saving across five lines`}
                  label="Review"
                  onClick={() => onModal("approve-input-order")}
                />
                <ActionRow
                  icon={HandCoins}
                  title="Release ready sale payouts"
                  note={`${kes(COOP_CONTEXT.pendingPayout)} is pending grading or PIN`}
                  label="Payouts"
                  onClick={() => onModal("pay-member-payout")}
                />
                <ActionRow
                  icon={CalendarDays}
                  title="Set AGM notice"
                  note={`Annual general meeting due ${COOPERATIVE_PROFILE.annualMeeting}`}
                  label="Schedule"
                  onClick={() => onModal("schedule-agm")}
                />
              </div>
            </section>
          </Reveal>
        </div>
      </div>
      <Reveal delay={0.12}>
        <section className="gm-card mt-3">
          <DashboardSectionHeader
            eyebrow="Production collective"
            title="Acreage, yield and buyer value"
            subtitle="Farm plans shared by crop clusters for the January–March market window."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onModal("crop-forecast")}
              >
                <Sprout /> Update forecast
              </button>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Crop cluster</th>
                  <th>Growers</th>
                  <th>Collective acreage</th>
                  <th>Expected yield</th>
                  <th>Estimated output</th>
                  <th>Market value</th>
                </tr>
              </thead>
              <tbody>
                {CROP_DASHBOARD.map((crop) => (
                  <tr key={crop.id}>
                    <td>
                      <strong>{crop.crop}</strong>
                      <small className="d-block text-muted">
                        Kiambu pooled plan
                      </small>
                    </td>
                    <td>{crop.members} growers</td>
                    <td>{crop.acreage} acres</td>
                    <td>{crop.yield}</td>
                    <td>{crop.output}</td>
                    <td>
                      <strong>{kes(crop.marketValue)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gm-plan-detail-hero mt-3">
            <span className="gm-mega-icon">
              <Leaf />
            </span>
            <div style={{ flex: 1 }}>
              <strong>
                {kes(COOP_CONTEXT.totalValue)} estimated seasonal market value
              </strong>
              <p className="mb-0 text-muted">
                A pooled projection supports buyer negotiations and input
                ordering; actual payments follow graded delivery and confirmed
                buyer settlement.
              </p>
            </div>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => onModal("record-acreage")}
            >
              Update acreage
            </button>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function ProfileFact({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof BadgeCheck;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="col-sm-6">
      <div className="gm-check-row h-100">
        <Icon />
        <span>
          <small>{label}</small>
          <strong>{value}</strong>
          <small>{note}</small>
        </span>
      </div>
    </div>
  );
}
function ActionRow({
  icon: Icon,
  title,
  note,
  label,
  onClick,
}: {
  icon: typeof ShoppingBasket;
  title: string;
  note: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="gm-check-row">
      <Icon />
      <span style={{ flex: 1 }}>
        <strong>{title}</strong>
        <small>{note}</small>
      </span>
      <button
        type="button"
        className="gm-btn gm-btn-soft gm-btn-sm"
        onClick={onClick}
      >
        {label}
        <ChevronRight />
      </button>
    </div>
  );
}
function EyeIcon() {
  return <FileText />;
}

function MembersContent({
  members,
  search,
  status,
  page,
  pages,
  total,
  menu,
  onSearch,
  onStatus,
  onPage,
  onOpen,
  onMenu,
  onModal,
}: {
  members: CooperativeMember[];
  search: string;
  status: "All" | CooperativeMember["status"];
  page: number;
  pages: number;
  total: number;
  menu: string | null;
  onSearch: (value: string) => void;
  onStatus: (value: "All" | CooperativeMember["status"]) => void;
  onPage: (value: number) => void;
  onOpen: (member: CooperativeMember) => void;
  onMenu: (id: string | null) => void;
  onModal: (id: CooperativeModalId) => void;
}) {
  return (
    <section className="gm-card mt-4">
      <DashboardSectionHeader
        eyebrow="Member register"
        title="45 growers, shares and farm records"
        subtitle="Search the visible member directory; totals represent the complete registered cooperative."
        action={
          <div className="d-flex gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => onModal("export-register")}
            >
              <FileSpreadsheet /> Export
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => onModal("add-member")}
            >
              <Plus /> Add member
            </button>
          </div>
        }
      />
      <div className="gm-toolbar mt-3">
        <label className="gm-search">
          <Search />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search member, farm, ward or crop"
          />
        </label>
        <select
          className="gm-select"
          value={status}
          onChange={(event) =>
            onStatus(event.target.value as "All" | CooperativeMember["status"])
          }
          aria-label="Filter member status"
        >
          <option>All</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
        </select>
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Farm & crops</th>
              <th>Land</th>
              <th>Shares</th>
              <th>Account balance</th>
              <th>Status</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <button
                    type="button"
                    className="gm-table-link"
                    onClick={() => onOpen(member)}
                  >
                    <strong>{member.name}</strong>
                    <small>
                      {member.id} · {member.phone}
                    </small>
                  </button>
                </td>
                <td>
                  <strong>{member.farm}</strong>
                  <small>
                    {member.crops} · {member.ward}
                  </small>
                </td>
                <td>{member.acreage} ac</td>
                <td>{member.shares} shares</td>
                <td>{kes(member.balance)}</td>
                <td>
                  <StatusChip
                    label={member.status}
                    tone={memberTone(member.status)}
                  />
                </td>
                <td className="text-end">
                  <div className="gm-dropdown">
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Actions for ${member.name}`}
                      onClick={() =>
                        onMenu(menu === member.id ? null : member.id)
                      }
                    >
                      <MoreHorizontal />
                    </button>
                    {menu === member.id ? (
                      <div className="gm-menu">
                        <p className="gm-menuhead">{member.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            onOpen(member);
                            onMenu(null);
                          }}
                        >
                          Open member
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onOpen(member);
                            onModal("share-transaction");
                            onMenu(null);
                          }}
                        >
                          Record shares
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onOpen(member);
                            onModal("individual-sms");
                            onMenu(null);
                          }}
                        >
                          Send SMS
                        </button>
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={pages}
        perPage={5}
        totalItems={total}
        onChange={onPage}
      />
    </section>
  );
}

function InputsContent({
  onOpen,
  onModal,
}: {
  onOpen: (line: InputLine) => void;
  onModal: (id: CooperativeModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Input buying round · October"
          title="Buy as one, save for every farm"
          subtitle="Member quantities are aggregated before supplier comparison, board approval and collection."
          action={
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => onModal("submit-input-needs")}
            >
              <Plus /> Open needs round
            </button>
          }
        />
        <div className="row g-3 mt-1">
          <MetricCard
            icon={UsersRound}
            value="35"
            label="members participating"
            note="Across five pooled input lines"
          />
          <MetricCard
            icon={ShoppingBasket}
            value={kes(COOP_CONTEXT.savings)}
            label="collective saving"
            note="Versus retail individual prices"
          />
          <MetricCard
            icon={PackageCheck}
            value="285"
            label="confirmed units"
            note="Bags, sachets, kilograms and tonnes"
          />
        </div>
        <div className="gm-table-wrap mt-4">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Input</th>
                <th>Members</th>
                <th>Pooled quantity</th>
                <th>Retail / bulk</th>
                <th>Member saving</th>
                <th>Supplier</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {BULK_INPUT_LINES.map((line) => (
                <tr key={line.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onOpen(line)}
                    >
                      <strong>{line.input}</strong>
                      <small>{line.id}</small>
                    </button>
                  </td>
                  <td>{line.members}</td>
                  <td>{line.quantity}</td>
                  <td>
                    {kes(line.individual)} / {kes(line.bulk)}
                  </td>
                  <td>
                    <strong>{kes(line.totalSaving)}</strong>
                    <small>{kes(line.saving)} each</small>
                  </td>
                  <td>{line.supplier}</td>
                  <td>
                    <StatusChip
                      label={line.state}
                      tone={line.state === "Confirmed" ? "low" : "medium"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="row g-3 mt-3">
        <div className="col-lg-7">
          <div className="gm-card h-100">
            <DashboardSectionHeader
              eyebrow="Accountable workflow"
              title="From needs to member collection"
            />{" "}
            <div className="gm-check-list">
              {INPUT_WORKFLOW.map((step, index) => (
                <div className="gm-check-row" key={step}>
                  <span className="gm-step-number">{index + 1}</span>
                  <span>
                    <strong>{step}</strong>
                    <small>
                      {index < 3
                        ? "Member and board record required"
                        : "Visible in the cooperative buying timeline"}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="gm-card h-100">
            <DashboardSectionHeader
              eyebrow="Next approval"
              title="Choose a supplier, then order"
              subtitle="Yara Kenya has the leading DAP and CAN price after volume pricing."
            />
            <div className="d-grid gap-2 mt-3">
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => onModal("request-quotes")}
              >
                <MailCheck /> Request quotes
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => onModal("select-supplier")}
              >
                <ClipboardCheck /> Compare quotes
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => onModal("place-bulk-order")}
              >
                <Send /> Place approved order
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
function MetricCard({
  icon: Icon,
  value,
  label,
  note,
}: {
  icon: typeof UsersRound;
  value: string;
  label: string;
  note: string;
}) {
  return (
    <div className="col-md-4">
      <DashboardMetric icon={Icon} value={value} label={label} note={note} />
    </div>
  );
}

function MarketingContent({
  sales,
  search,
  page,
  pages,
  total,
  onSearch,
  onPage,
  onMember,
  onModal,
}: {
  sales: SaleContribution[];
  search: string;
  page: number;
  pages: number;
  total: number;
  onSearch: (value: string) => void;
  onPage: (value: number) => void;
  onMember: (name: string) => void;
  onModal: (id: CooperativeModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Pooled marketing · January harvest"
          title="Grade together, negotiate from strength"
          subtitle="Collection, quality and payout records keep every member's sale contribution transparent."
          action={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("grade-produce")}
              >
                <ClipboardCheck /> Grade produce
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onModal("record-collective-sale")}
              >
                <Plus /> Record sale
              </button>
            </div>
          }
        />
        <div className="gm-plan-detail-hero mt-3">
          <span className="gm-mega-icon">
            <Sprout />
          </span>
          <div style={{ flex: 1 }}>
            <span className="gm-eyebrow">
              Buyer receipt · Fresh Produce Kenya Ltd
            </span>
            <h3 className="font-display mb-1">{COLLECTIVE_SALE.crop}</h3>
            <p className="mb-0 text-muted">
              {COLLECTIVE_SALE.heads.toLocaleString()} heads · delivery from
              Githunguri collection centre · {COLLECTIVE_SALE.collectivePrice}
            </p>
          </div>
          <div className="text-end">
            <strong
              className="font-display d-block"
              style={{ fontSize: "1.35rem" }}
            >
              {kes(COLLECTIVE_SALE.value)}
            </strong>
            <small className="text-muted">gross pooled receipt</small>
          </div>
        </div>
        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <div className="gm-card gm-card-inset h-100">
              <small className="text-muted">Collective selling price</small>
              <strong className="font-display d-block mt-1">
                {COLLECTIVE_SALE.collectivePrice}
              </strong>
              <small>Fresh Produce Kenya quality contract</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="gm-card gm-card-inset h-100">
              <small className="text-muted">Individual roadside price</small>
              <strong className="font-display d-block mt-1">
                {COLLECTIVE_SALE.individualPrice}
              </strong>
              <small>Typical fragmented-sale benchmark</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="gm-card gm-card-inset h-100">
              <small className="text-muted">Collective premium retained</small>
              <strong className="font-display d-block mt-1">
                {kes(COLLECTIVE_SALE.premium)}
              </strong>
              <small>Before agreed transport and handling</small>
            </div>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-4">
          <label className="gm-search">
            <Search />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Find sale member or receipt"
            />
          </label>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm ms-auto"
            onClick={() => onModal("buyer-receipt")}
          >
            <ReceiptText /> Buyer receipt
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-mpesa gm-btn-sm"
            onClick={() => onModal("pay-member-payout")}
          >
            <HandCoins /> Release payout
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Member contributor</th>
                <th>Delivered</th>
                <th>Grade A / B / C</th>
                <th>Sale allocation</th>
                <th>Payout</th>
                <th>Receipt / action</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onMember(sale.member)}
                    >
                      <strong>{sale.member}</strong>
                      <small>{sale.id}</small>
                    </button>
                  </td>
                  <td>{sale.contributed.toLocaleString()} heads</td>
                  <td>
                    {sale.gradeA.toLocaleString()} /{" "}
                    {sale.gradeB.toLocaleString()} /{" "}
                    {sale.gradeC.toLocaleString()}
                  </td>
                  <td>
                    <strong>{kes(sale.value)}</strong>
                  </td>
                  <td>
                    <StatusChip
                      label={sale.payment}
                      tone={
                        sale.payment === "Paid"
                          ? "low"
                          : sale.payment === "Ready"
                            ? "medium"
                            : "neutral"
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() =>
                        sale.payment === "Paid"
                          ? onModal("buyer-receipt")
                          : onModal("pay-member-payout")
                      }
                    >
                      {sale.receipt}
                      <ChevronRight />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={pages}
          perPage={5}
          totalItems={total}
          onChange={onPage}
        />
      </section>
    </div>
  );
}

function FinanceContent({
  tab,
  onTab,
  onAccount,
  onModal,
}: {
  tab: FinanceTab;
  onTab: (tab: FinanceTab) => void;
  onAccount: (id: string) => void;
  onModal: (id: CooperativeModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Cooperative finance"
          title="Five protected accounts, clear member reporting"
          subtitle="The board uses KCB and M-Pesa with document trails, signatory authority and audit-ready reports."
          action={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("financial-report")}
              >
                <FileText /> Prepare report
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onModal("transfer-funds")}
              >
                <HandCoins /> Transfer funds
              </button>
            </div>
          }
        />
        <PlannerSubtabs
          value={tab}
          label="Finance views"
          onChange={onTab}
          items={[
            { id: "accounts", label: "Accounts", icon: <Landmark />, count: 5 },
            {
              id: "reports",
              label: "Statements & audit",
              icon: <FileText />,
              count: 4,
            },
          ]}
        />
        {tab === "accounts" ? (
          <>
            <div className="row g-3 mt-1">
              {COOP_ACCOUNTS.map((account) => (
                <div className="col-md-6 col-xl" key={account.id}>
                  <button
                    type="button"
                    className="gm-stat gm-card-button h-100 text-start"
                    onClick={() => onAccount(account.id)}
                  >
                    <span className="gm-mega-icon">
                      <WalletCards />
                    </span>
                    <strong className="gm-stat-value font-display">
                      {kes(account.balance)}
                    </strong>
                    <span className="gm-stat-label">{account.account}</span>
                    <small className="gm-stat-sub">{account.type}</small>
                  </button>
                </div>
              ))}
            </div>
            <div className="gm-table-wrap mt-4">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Purpose</th>
                    <th>Balance</th>
                    <th>Authority & note</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {COOP_ACCOUNTS.map((account) => (
                    <tr key={account.id}>
                      <td>
                        <strong>{account.account}</strong>
                        <small>{account.id}</small>
                      </td>
                      <td>{account.type}</td>
                      <td>
                        <strong>{kes(account.balance)}</strong>
                      </td>
                      <td>{account.note}</td>
                      <td>
                        <button
                          type="button"
                          className="gm-btn gm-btn-soft gm-btn-sm"
                          onClick={() => onAccount(account.id)}
                        >
                          Details <ChevronRight />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Period</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {FINANCIAL_REPORTS.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <strong>{report.name}</strong>
                    </td>
                    <td>{report.period}</td>
                    <td>{report.note}</td>
                    <td>
                      <StatusChip
                        label={report.status}
                        tone={report.status === "Ready" ? "low" : "medium"}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-soft gm-btn-sm"
                        onClick={() =>
                          report.name === "Annual audit pack"
                            ? onModal("audit-pack")
                            : onModal("financial-report")
                        }
                      >
                        Open <ChevronRight />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="gm-plan-detail-hero mt-4">
          <span className="gm-mega-icon">
            <ShieldCheck />
          </span>
          <div style={{ flex: 1 }}>
            <strong>Two-signatory controls guard group money</strong>
            <p className="mb-0 text-muted">
              Chairperson Mary Wanjiku, secretary Peter Kamau and treasurer
              Grace Wanjiku approve protected action records.
            </p>
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => onModal("audit-pack")}
          >
            Audit pack
          </button>
        </div>
      </section>
    </div>
  );
}

function ContractsContent({
  contracts,
  status,
  page,
  pages,
  total,
  onStatus,
  onPage,
  onOpen,
  onModal,
}: {
  contracts: CoopContract[];
  status: "All" | CoopContract["status"];
  page: number;
  pages: number;
  total: number;
  onStatus: (status: "All" | CoopContract["status"]) => void;
  onPage: (page: number) => void;
  onOpen: (contract: CoopContract) => void;
  onModal: (id: CooperativeModalId) => void;
}) {
  return (
    <section className="gm-card mt-4">
      <DashboardSectionHeader
        eyebrow="Partner register"
        title="Contracts built for member allocation"
        subtitle="Buyer and supplier agreements remain connected to crop plans, values and participating members."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={() => onModal("new-contract")}
          >
            <Plus /> New contract
          </button>
        }
      />
      <div className="gm-toolbar mt-3">
        <select
          className="gm-select"
          value={status}
          onChange={(event) => {
            onStatus(event.target.value as "All" | CoopContract["status"]);
          }}
          aria-label="Filter contract status"
        >
          <option>All</option>
          <option>Active</option>
          <option>Negotiating</option>
          <option>Renewal due</option>
          <option>Completed</option>
        </select>
        <div className="d-flex gap-2 ms-auto">
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => onModal("negotiation-note")}
          >
            <MessageCircle /> Negotiation note
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => onModal("review-contract")}
          >
            <ClipboardCheck /> Board review
          </button>
        </div>
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Agreement</th>
              <th>Partner</th>
              <th>Crop & period</th>
              <th>Value</th>
              <th>Member allocation</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id}>
                <td>
                  <button
                    type="button"
                    className="gm-table-link"
                    onClick={() => onOpen(contract)}
                  >
                    <strong>{contract.contract}</strong>
                    <small>{contract.id}</small>
                  </button>
                </td>
                <td>
                  <strong>{contract.partner}</strong>
                  <small>{contract.contact}</small>
                </td>
                <td>
                  {contract.crop}
                  <small>{contract.duration}</small>
                </td>
                <td>
                  <strong>{contract.value}</strong>
                </td>
                <td>{contract.memberCount} members</td>
                <td>
                  <StatusChip
                    label={contract.status}
                    tone={contractTone(contract.status)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={() => onOpen(contract)}
                  >
                    Open <ChevronRight />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={pages}
        perPage={4}
        totalItems={total}
        onChange={onPage}
      />
    </section>
  );
}

function CommunicationsContent({
  entries,
  search,
  page,
  pages,
  total,
  onSearch,
  onPage,
  onModal,
}: {
  entries: typeof COMMUNICATIONS;
  search: string;
  page: number;
  pages: number;
  total: number;
  onSearch: (value: string) => void;
  onPage: (value: number) => void;
  onModal: (id: CooperativeModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Member communication desk"
          title="Every update reaches the right grower"
          subtitle="SMS, WhatsApp-style crop groups, GrowMO push and individual notices stay accountable."
          action={
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => onModal("broadcast-sms")}
            >
              <Send /> Broadcast SMS
            </button>
          }
        />
        <div className="row g-3 mt-1">
          <ChannelCard
            icon={Phone}
            title="Broadcast SMS"
            note="45 members · delivery trail"
            onClick={() => onModal("broadcast-sms")}
          />
          <ChannelCard
            icon={MessageCircle}
            title="WhatsApp crop groups"
            note="Cabbage and potato clusters"
            onClick={() => onModal("whatsapp-update")}
          />
          <ChannelCard
            icon={MailCheck}
            title="GrowMO push"
            note="No SMS charge to member"
            onClick={() => onModal("push-update")}
          />
          <ChannelCard
            icon={ReceiptText}
            title="Collection notice"
            note="Input and delivery reminders"
            onClick={() => onModal("delivery-notice")}
          />
        </div>
        <div className="gm-toolbar mt-4">
          <label className="gm-search">
            <Search />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search a member, channel or message"
            />
          </label>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm ms-auto"
            onClick={() => onModal("individual-sms")}
          >
            <Phone /> Individual SMS
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Audience</th>
                <th>Message</th>
                <th>Delivery</th>
                <th>Sent / schedule</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <strong>{entry.channel}</strong>
                    <small>{entry.id}</small>
                  </td>
                  <td>{entry.audience}</td>
                  <td>{entry.message}</td>
                  <td>
                    <StatusChip
                      label={entry.status}
                      tone={
                        entry.status === "Sent" || entry.status === "Delivered"
                          ? "low"
                          : entry.status === "Draft"
                            ? "neutral"
                            : "medium"
                      }
                    />
                  </td>
                  <td>{entry.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={pages}
          perPage={5}
          totalItems={total}
          onChange={onPage}
        />
      </section>
    </div>
  );
}
function ChannelCard({
  icon: Icon,
  title,
  note,
  onClick,
}: {
  icon: typeof Phone;
  title: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <div className="col-sm-6 col-xl-3">
      <button
        type="button"
        className="gm-card gm-card-button h-100 text-start"
        onClick={onClick}
      >
        <span className="gm-mega-icon">
          <Icon />
        </span>
        <strong className="d-block mt-2">{title}</strong>
        <small className="text-muted">{note}</small>
        <span className="d-flex align-items-center gap-1 mt-2">
          Create update <ArrowRight />
        </span>
      </button>
    </div>
  );
}

function CooperativeDrawer({
  drawer,
  member,
  contract,
  input,
  account,
  onClose,
  onModal,
}: {
  drawer: DrawerId;
  member: CooperativeMember | null;
  contract: CoopContract | null;
  input: InputLine | null;
  account: (typeof COOP_ACCOUNTS)[number];
  onClose: () => void;
  onModal: (id: CooperativeModalId) => void;
}) {
  const title =
    drawer === "profile"
      ? "Cooperative profile"
      : drawer === "member"
        ? (member?.name ?? "Member profile")
        : drawer === "contract"
          ? (contract?.contract ?? "Contract")
          : drawer === "input"
            ? (input?.input ?? "Input order")
            : account.account;
  return (
    <DashboardDrawer
      open={Boolean(drawer)}
      title={title}
      onClose={onClose}
      footer={
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close record
        </button>
      }
    >
      {drawer === "profile" ? (
        <>
          <span className="gm-eyebrow">
            {COOPERATIVE_PROFILE.registration} · {COOPERATIVE_PROFILE.status}
          </span>
          <h3 className="font-display mt-2">{COOPERATIVE_PROFILE.name}</h3>
          <p className="text-muted">
            {COOPERATIVE_PROFILE.address}
            <br />
            {COOPERATIVE_PROFILE.office}, {COOPERATIVE_PROFILE.county} County
          </p>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <Sprout />
              <span>
                <strong>{COOPERATIVE_PROFILE.type}</strong>
                <small>
                  {COOPERATIVE_PROFILE.crops} · {COOPERATIVE_PROFILE.members}{" "}
                  members across {COOPERATIVE_PROFILE.acreage} acres
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <BadgeCheck />
              <span>
                <strong>Logo & constitution on file</strong>
                <small>
                  {COOPERATIVE_PROFILE.logo} · AGM{" "}
                  {COOPERATIVE_PROFILE.annualMeeting}
                </small>
              </span>
            </div>
            {COOPERATIVE_PROFILE.signatories.map((signatory) => (
              <div className="gm-check-row" key={signatory.id}>
                <UsersRound />
                <span>
                  <strong>
                    {signatory.name} · {signatory.role}
                  </strong>
                  <small>
                    ID {signatory.idNumber} · {signatory.phone}
                  </small>
                </span>
              </div>
            ))}
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("edit-cooperative")}
            >
              Edit cooperative profile
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("manage-signatories")}
            >
              Manage signatories
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => onModal("registration-detail")}
            >
              Open registration record
            </button>
          </div>
        </>
      ) : null}
      {drawer === "member" && member ? (
        <>
          <span className="gm-eyebrow">
            {member.id} · Joined {member.joined}
          </span>
          <h3 className="font-display mt-2">{member.name}</h3>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <MapPin />
              <span>
                <strong>
                  {member.farm} · {member.ward}
                </strong>
                <small>
                  {member.acreage} acres · {member.crops}
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <Building2 />
              <span>
                <strong>{member.shares} cooperative shares</strong>
                <small>
                  {kes(member.balance)} current cooperative account balance
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <Phone />
              <span>
                <strong>{member.phone}</strong>
                <small>
                  ID {member.idNumber} · {member.status} membership
                </small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("edit-member")}
            >
              Edit member profile
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("share-transaction")}
            >
              Record share transaction
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("member-statement")}
            >
              Download member statement
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("individual-sms")}
            >
              Send individual SMS
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-mpesa"
              onClick={() => onModal("pay-member-payout")}
            >
              M-Pesa sale payout
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-danger-soft"
              onClick={() => onModal("suspend-member")}
            >
              {member.status === "Suspended"
                ? "Reinstate member"
                : "Suspend member"}
            </button>
          </div>
        </>
      ) : null}
      {drawer === "input" && input ? (
        <>
          <span className="gm-eyebrow">
            {input.id} · {input.state}
          </span>
          <h3 className="font-display mt-2">{input.input}</h3>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <UsersRound />
              <span>
                <strong>{input.members} member commitments</strong>
                <small>{input.quantity} total pooled quantity</small>
              </span>
            </div>
            <div className="gm-check-row">
              <Banknote />
              <span>
                <strong>{kes(input.bulk)} cooperative price</strong>
                <small>
                  {kes(input.saving)} saved per unit · {kes(input.totalSaving)}{" "}
                  collective saving
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <PackageCheck />
              <span>
                <strong>{input.supplier}</strong>
                <small>
                  Supplier quote and delivery record connected to this input
                  line.
                </small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("review-input-aggregate")}
            >
              Review aggregate
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("record-delivery")}
            >
              Record delivery
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("collection-notice")}
            >
              Send collection notice
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-mpesa"
              onClick={() => onModal("pay-input-share")}
            >
              Record M-Pesa payment
            </button>
          </div>
        </>
      ) : null}
      {drawer === "contract" && contract ? (
        <>
          <span className="gm-eyebrow">
            {contract.id} · {contract.status}
          </span>
          <h3 className="font-display mt-2">{contract.contract}</h3>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <Building2 />
              <span>
                <strong>{contract.partner}</strong>
                <small>Partner contact {contract.contact}</small>
              </span>
            </div>
            <div className="gm-check-row">
              <Sprout />
              <span>
                <strong>{contract.crop}</strong>
                <small>
                  {contract.memberCount} allocated members · {contract.duration}
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <Banknote />
              <span>
                <strong>{contract.value}</strong>
                <small>Agreement value and status visible to the board</small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("contract-detail")}
            >
              Contract detail
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("negotiation-note")}
            >
              Add negotiation note
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => onModal("send-esignature")}
            >
              Send e-signature
            </button>
          </div>
        </>
      ) : null}
      {drawer === "account" ? (
        <>
          <span className="gm-eyebrow">
            {account.id} · {account.type}
          </span>
          <h3 className="font-display mt-2">{account.account}</h3>
          <strong className="font-display d-block" style={{ fontSize: "2rem" }}>
            {kes(account.balance)}
          </strong>
          <p className="text-muted">{account.note}</p>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>Protected group money</strong>
                <small>
                  Transactions retain approval evidence and feed the member
                  financial reporting record.
                </small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("account-detail")}
            >
              Account activity
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-mpesa"
              onClick={() => onModal("transfer-funds")}
            >
              Transfer with signatories
            </button>
          </div>
        </>
      ) : null}
    </DashboardDrawer>
  );
}

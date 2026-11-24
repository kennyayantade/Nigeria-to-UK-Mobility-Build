import { Heading } from "@/components/ui/Heading";
import { Icon, type IconName } from "@/components/ui/Icon";

export interface InfoItem {
  icon: IconName;
  title: string;
  body: string;
}

export function InfoColumns({ items }: { items: InfoItem[] }) {
  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-14">
      {items.map((item) => (
        <div key={item.title} className="grid grid-cols-[3rem_1fr] gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-paper text-brand-purple ring-1 ring-line">
            <Icon name={item.icon} className="size-6" />
          </span>
          <div>
            <Heading as="h3" size="subheading">
              {item.title}
            </Heading>
            <p className="mt-2 max-w-[56ch] text-muted">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

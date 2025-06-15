import mongoose, { Document, Schema } from "mongoose";

export interface IBadge {
  id: string;
  description: string;
  icon: string;
  link?: string;
}

export interface INameplate {
  sku_id: string;
  asset: string;
  label: string;
  palette: string;
}

export interface IClan {
  identity_guild_id: string | null;
  identity_enabled: boolean;
  tag: string | null;
  badge: string | null;
}

export interface IUser extends Document {
  _id: string;
  nameplate: INameplate | null;
  badges: IBadge[];
  clan: IClan | null;
  lastUpdated: Date;
  createdAt: Date;
}

const BadgeSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    link: { type: String, default: null },
  },
  { _id: false }
);

const NameplateSchema: Schema = new Schema(
  {
    sku_id: { type: String, required: true },
    asset: { type: String, required: true },
    label: { type: String, required: true },
    palette: { type: String, required: true },
  },
  { _id: false }
);

const ClanSchema: Schema = new Schema(
  {
    identity_guild_id: { type: String, default: null },
    identity_enabled: { type: Boolean, required: true },
    tag: { type: String, default: null },
    badge: { type: String, default: null },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    nameplate: { type: NameplateSchema, default: null },
    badges: { type: [BadgeSchema], default: [] },
    clan: { type: ClanSchema, default: null },
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  {
    _id: false,
    versionKey: false,
  }
);

export default mongoose.model<IUser>("User", UserSchema);

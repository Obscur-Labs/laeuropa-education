"use client";

import { useActionState, useTransition } from "react";
import { submitEnquiry, type EnquiryState } from "./actions";

const SERVICES = [
  "Country and University Selection Assistance",
  "University / Institution Application Assistance",
  "Student Visa / Residence-Permit Application Preparation Assistance",
  "Not sure yet — need counselling",
];
const LEVELS = ["Bachelor's", "Master's", "MBA", "Diploma / Certificate", "PhD / Research", "Foundation"];

export default function ContactForm({ countries, preCountry, preService, legalName }: {
  countries: string[]; preCountry: string; preService: string; legalName: string;
}) {
  const [state, action] = useActionState<EnquiryState, FormData>(submitEnquiry, null);
  const [pending, start] = useTransition();
  const v = state?.values ?? {};
  // Values survive a failed submission because the form is not reset (no <form action>)
  return (
    <>
      {state?.errors?.length ? (
        <div className="alert alert-error" role="alert">{state.errors.map((e) => <p key={e}>{e}</p>)}</div>
      ) : null}
      <form className="form" noValidate onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); start(() => action(fd)); }}>
        <div className="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <div className="form-row">
          <label className="field"><span>Full name *</span><input type="text" name="name" defaultValue={v.name} required autoComplete="name" maxLength={150} /></label>
          <label className="field"><span>Phone / WhatsApp *</span><input type="tel" name="phone" defaultValue={v.phone} required autoComplete="tel" placeholder="+91" maxLength={20} /></label>
        </div>
        <div className="form-row">
          <label className="field"><span>Email</span><input type="email" name="email" defaultValue={v.email} autoComplete="email" maxLength={150} /></label>
          <label className="field"><span>City</span><input type="text" name="city" defaultValue={v.city} placeholder="Your city" maxLength={150} /></label>
        </div>
        <div className="form-row">
          <label className="field"><span>Preferred country</span>
            <select name="country" defaultValue={v.country ?? preCountry}>
              <option value="">Not decided yet</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="field"><span>Study level</span>
            <select name="level" defaultValue={v.level ?? ""}>
              <option value="">Select</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
        </div>
        <label className="field"><span>Service needed</span>
          <select name="service" defaultValue={v.service ?? (SERVICES.includes(preService) ? preService : SERVICES[0])}>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="field"><span>Message</span><textarea name="message" rows={4} defaultValue={v.message} maxLength={2000} placeholder="Tell us about your course interest, intake or questions…" /></label>
        <label className="consent">
          <input type="checkbox" name="consent" value="1" defaultChecked={v.consent === "1"} required />
          <span>I have read the <a href="/privacy-policy" target="_blank">Privacy Policy</a> and consent to {legalName} using my details to respond to this enquiry and contact me by phone, WhatsApp or email. I can withdraw this consent at any time.</span>
        </label>
        <button type="submit" className="btn btn-red btn-lg btn-block" disabled={pending}>{pending ? "Sending…" : "Send enquiry"}</button>
      </form>
    </>
  );
}

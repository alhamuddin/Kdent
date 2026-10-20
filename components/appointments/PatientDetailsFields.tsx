type PatientDetailsFieldsProps = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  heightCm?: string;
  weightKg?: string;
  fieldClassName?: string;
};

const inputClassName =
  "w-full rounded-lg border border-white/10 bg-background px-3 py-2";

export default function PatientDetailsFields({
  firstName = "",
  lastName = "",
  phone = "",
  email = "",
  heightCm = "",
  weightKg = "",
  fieldClassName = "",
}: PatientDetailsFieldsProps) {
  return (
    <>
      <label className={`space-y-1 text-sm ${fieldClassName}`}>
        <span>First name</span>
        <input
          className={inputClassName}
          defaultValue={firstName}
          name="firstName"
          required
        />
      </label>
      <label className={`space-y-1 text-sm ${fieldClassName}`}>
        <span>Last name</span>
        <input
          className={inputClassName}
          defaultValue={lastName}
          name="lastName"
        />
      </label>
      <label className={`space-y-1 text-sm ${fieldClassName}`}>
        <span>Phone</span>
        <input className={inputClassName} defaultValue={phone} name="phone" required />
      </label>
      <label className={`space-y-1 text-sm ${fieldClassName}`}>
        <span>Email (optional)</span>
        <input
          className={inputClassName}
          defaultValue={email}
          name="email"
          type="email"
        />
      </label>
      <label className={`space-y-1 text-sm ${fieldClassName}`}>
        <span>Height in cm (optional)</span>
        <input
          className={inputClassName}
          defaultValue={heightCm}
          min="30"
          max="250"
          name="heightCm"
          step="0.1"
          type="number"
        />
      </label>
      <label className={`space-y-1 text-sm ${fieldClassName}`}>
        <span>Weight in kg (optional)</span>
        <input
          className={inputClassName}
          defaultValue={weightKg}
          min="1"
          max="400"
          name="weightKg"
          step="0.1"
          type="number"
        />
      </label>
    </>
  );
}

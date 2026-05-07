import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal, Input, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { createBodyMeasurement } from '@/database/repositories/body';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const numOrNull = (s: string): number | null => {
  if (!s.trim()) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export const LogBodyModal: React.FC<Props> = ({ visible, onClose, onSaved }) => {
  const t = useTheme();
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [neck, setNeck] = useState('');
  const [thighs, setThighs] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await createBodyMeasurement({
        measured_at: Date.now(),
        weight: numOrNull(weight),
        body_fat: numOrNull(bodyFat),
        chest: numOrNull(chest),
        waist: numOrNull(waist),
        arms: numOrNull(arms),
        neck: numOrNull(neck),
        thighs: numOrNull(thighs),
        notes: notes.trim() || null,
      });
      setWeight('');
      setBodyFat('');
      setChest('');
      setWaist('');
      setArms('');
      setNeck('');
      setThighs('');
      setNotes('');
      onSaved();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Log measurements">
      <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
        <Input
          label="Weight"
          keyboardType="decimal-pad"
          containerStyle={{ flex: 1 }}
          value={weight}
          onChangeText={setWeight}
        />
        <Input
          label="Body fat %"
          keyboardType="decimal-pad"
          containerStyle={{ flex: 1 }}
          value={bodyFat}
          onChangeText={setBodyFat}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
        <Input label="Chest" containerStyle={{ flex: 1 }} keyboardType="decimal-pad" value={chest} onChangeText={setChest} />
        <Input label="Waist" containerStyle={{ flex: 1 }} keyboardType="decimal-pad" value={waist} onChangeText={setWaist} />
      </View>
      <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
        <Input label="Arms" containerStyle={{ flex: 1 }} keyboardType="decimal-pad" value={arms} onChangeText={setArms} />
        <Input label="Neck" containerStyle={{ flex: 1 }} keyboardType="decimal-pad" value={neck} onChangeText={setNeck} />
        <Input label="Thighs" containerStyle={{ flex: 1 }} keyboardType="decimal-pad" value={thighs} onChangeText={setThighs} />
      </View>
      <Input label="Notes" value={notes} onChangeText={setNotes} multiline />
      <Button title="Save" onPress={submit} loading={busy} fullWidth />
    </Modal>
  );
};

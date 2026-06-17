import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCountdownTo9pm } from '../utils/countdown';
import { Colors, Fonts, FontSizes } from '../theme';

export default function Countdown() {
  const [time, setTime] = useState(getCountdownTo9pm());

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdownTo9pm()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.row}>
      {[time.h, time.m, time.s].map((val, i) => (
        <React.Fragment key={i}>
          <View style={styles.unit}>
            <Text style={styles.num}>{val}</Text>
            <Text style={styles.label}>{['hrs', 'min', 'sec'][i]}</Text>
          </View>
          {i < 2 && <Text style={styles.colon}>:</Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  unit: { alignItems: 'center' },
  num: { fontFamily: Fonts.serif, fontSize: 32, color: Colors.white, lineHeight: 34 },
  label: { fontSize: FontSizes.xs, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  colon: { fontFamily: Fonts.serif, fontSize: 28, color: Colors.lilac, marginTop: 2 },
});

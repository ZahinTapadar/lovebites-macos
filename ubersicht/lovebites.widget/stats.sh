#!/bin/bash
# Prints one JSON object for the LoveBites widget. macmon (no sudo) gives temps + P-core MHz on Apple silicon.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
ncpu=$(sysctl -n hw.ncpu)
cpu=$(ps -A -o %cpu= | awk -v n="$ncpu" '{s+=$1} END {v=s/n; if (v>100) v=100; printf "%d", v}')
total=$(sysctl -n hw.memsize)
used=$(vm_stat | awk '/page size of/{ps=$8} /Pages active/{a=$3} /wired down/{w=$4} /occupied by compressor/{c=$5} END {printf "%d", (a+w+c)*ps}')
iface=$(route -n get default 2>/dev/null | awk '/interface:/{print $2}')
rx=0; [ -n "$iface" ] && rx=$(netstat -ibn -I "$iface" | awk 'NR==2{print $7}')
boot=$(sysctl -n kern.boottime | awk -F'[ ,]+' '{print $4}')
mac=null; command -v macmon >/dev/null && mac=$(macmon pipe -s 1 -i 400 2>/dev/null | head -1)
[ -z "$mac" ] && mac=null
dark=false; [ "$(defaults read -g AppleInterfaceStyle 2>/dev/null)" = Dark ] && dark=true
printf '{"dark":%s,"cpu":%s,"used":%s,"total":%s,"iface":"%s","rx":%s,"up":%s,"chip":"%s","mac":%s}\n' \
  "$dark" "$cpu" "$used" "$total" "$iface" "${rx:-0}" "$(( $(date +%s) - boot ))" "$(sysctl -n machdep.cpu.brand_string)" "$mac"

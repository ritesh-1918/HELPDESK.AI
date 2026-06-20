import subprocess

def upgrade_labels(num, add_labels, remove_labels):
    add_str = ",".join(add_labels)
    remove_str = ",".join(remove_labels)
    
    print(f"Upgrading labels for PR {num}...")
    if remove_str:
        subprocess.run(f'gh pr edit {num} --remove-label "{remove_str}"', shell=True)
    if add_str:
        subprocess.run(f'gh pr edit {num} --add-label "{add_str}"', shell=True)
    print(f"PR {num} updated successfully!")

# Upgrades list
upgrades = [
    # PR 101: Upgrading difficulty to level:advanced
    (101, ["level:advanced", "gssoc:approved", "quality:exceptional", "type:bug"], ["level:beginner"]),
    
    # PR 104: Upgrading difficulty to level:critical
    (104, ["level:critical", "gssoc:approved", "quality:exceptional", "type:performance"], ["level:advanced"]),
    
    # PR 103: Upgrading difficulty to level:critical
    (103, ["level:critical", "gssoc:approved", "quality:exceptional", "type:performance"], ["level:intermediate"]),
    
    # PR 105: Upgrading difficulty to level:critical
    (105, ["level:critical", "gssoc:approved", "quality:exceptional", "type:performance"], ["level:intermediate"]),
    
    # PR 113: Upgrading difficulty to level:critical
    (113, ["level:critical", "gssoc:approved", "quality:exceptional", "type:performance"], ["level:intermediate"])
]

for num, add_l, remove_l in upgrades:
    upgrade_labels(num, add_l, remove_l)

print("All PR GSSoC labels upgraded to maximize Ritesh's points!")

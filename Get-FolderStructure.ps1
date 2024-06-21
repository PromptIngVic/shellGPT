param(
    [string]$Path = "."
)

function Get-FolderContent {
    param(
        [string]$Path
    )

    $items = Get-ChildItem -Path $Path
    $structure = @()

    foreach ($item in $items) {
        $object = New-Object PSObject -Property @{
            Name = $item.Name
            Path = $item.FullName
            Type = if ($item.PSIsContainer) { "Directory" } else { "File" }
        }

        if ($item.PSIsContainer) {
            $object | Add-Member -MemberType NoteProperty -Name "Content" -Value (Get-FolderContent -Path $item.FullName)
        }

        $structure += $object
    }

    return $structure
}

$folderStructure = Get-FolderContent -Path $Path
$folderStructure | ConvertTo-Json -Depth 10 | Out-File -FilePath "verzeichnisstruktur.json"
 
